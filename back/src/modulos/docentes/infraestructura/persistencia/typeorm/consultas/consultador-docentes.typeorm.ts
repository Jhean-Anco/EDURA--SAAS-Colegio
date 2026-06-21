import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AlcanceAcceso,
  ConsultadorDocentes,
  DocenteResumen,
  EspecialidadProfesionalResumen,
  FichaDocente,
} from '../../../../dominio/puertos/docentes.puerto';

interface FilaDocenteResumen {
  id: string;
  codigo: string;
  estado: string;
  persona_id: string;
  persona_nombres: string;
  persona_apellido_paterno: string | null;
  persona_apellido_materno: string | null;
  sede_principal: { id: string; nombre: string } | null;
  especialidad_principal: { id: string; nombre: string } | null;
}

interface FilaDocenteDetalle {
  id: string;
  codigo: string;
  estado: string;
  fecha_ingreso: string | null;
  fecha_cese: string | null;
  perfil_profesional: string | null;
  observacion: string | null;
  pid: string;
  nombres: string;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  doc_principal: Array<{ tipo_documento: string; tipo_codigo: string; numero: string }> | null;
  tiene_cuenta: boolean;
}

interface FilaAsignacionSede {
  id: string;
  id_sede: string;
  nombre_sede: string;
  es_principal: boolean;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string | null;
}

interface FilaAsignacionEspecialidad {
  id: string;
  id_especialidad_profesional: string;
  nombre_especialidad: string;
  es_principal: boolean;
  anios_experiencia: number | null;
  estado: string;
}

interface FilaConteo {
  total: string;
}

interface FilaIdDocente {
  id: string;
}

interface FilaEspecialidadResumen {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
}

@Injectable()
export class ConsultadorDocentesTypeorm implements ConsultadorDocentes {
  constructor(private readonly ds: DataSource) {}

  async listar(entrada: {
    alcance: AlcanceAcceso;
    idSede?: string | null;
    idEspecialidad?: string | null;
    estado?: string | null;
    busqueda?: string | null;
    pagina: number;
    limite: number;
  }): Promise<{ datos: DocenteResumen[]; total: number }> {
    const params: unknown[] = [entrada.alcance.institucionId];
    let idx = 2;

    const baseWhere = `FROM docentes d
      JOIN personas p ON p.id = d.id_persona
      WHERE d.id_institucion_educativa = $1`;

    let extraWhere = '';

    if (entrada.idSede) {
      extraWhere += ` AND EXISTS (
        SELECT 1 FROM asignaciones_docente_sede ads2
        WHERE ads2.id_docente = d.id AND ads2.id_sede = $${idx} AND ads2.estado = 'ACTIVA'
      )`;
      params.push(entrada.idSede);
      idx++;
    }

    if (entrada.idEspecialidad) {
      extraWhere += ` AND EXISTS (
        SELECT 1 FROM docentes_especialidades_profesionales dep2
        WHERE dep2.id_docente = d.id AND dep2.id_especialidad_profesional = $${idx} AND dep2.estado = 'ACTIVA'
      )`;
      params.push(entrada.idEspecialidad);
      idx++;
    }

    if (entrada.estado) {
      extraWhere += ` AND d.estado = $${idx}`;
      params.push(entrada.estado);
      idx++;
    }

    if (entrada.busqueda) {
      extraWhere += ` AND (
        d.codigo_normalizado ILIKE $${idx}
        OR p.nombres ILIKE $${idx}
        OR p.apellido_paterno ILIKE $${idx}
        OR p.apellido_materno ILIKE $${idx}
      )`;
      params.push(`%${entrada.busqueda}%`);
      idx++;
    }

    const fullWhere = baseWhere + extraWhere;
    const offset = (entrada.pagina - 1) * entrada.limite;

    const selectSql = `
      SELECT
        d.id, d.codigo, d.estado,
        p.id AS persona_id, p.nombres AS persona_nombres,
        p.apellido_paterno AS persona_apellido_paterno,
        p.apellido_materno AS persona_apellido_materno,
        (
          SELECT json_build_object('id', s.id, 'nombre', s.nombre)
          FROM asignaciones_docente_sede ads_p
          JOIN sedes s ON s.id = ads_p.id_sede
          WHERE ads_p.id_docente = d.id AND ads_p.es_principal = true AND ads_p.estado = 'ACTIVA'
          LIMIT 1
        ) AS sede_principal,
        (
          SELECT json_build_object('id', ep.id, 'nombre', ep.nombre)
          FROM docentes_especialidades_profesionales dep_p
          JOIN especialidades_profesionales ep ON ep.id = dep_p.id_especialidad_profesional
          WHERE dep_p.id_docente = d.id AND dep_p.es_principal = true AND dep_p.estado = 'ACTIVA'
          LIMIT 1
        ) AS especialidad_principal
      ${fullWhere}
      ORDER BY p.apellido_paterno ASC, p.nombres ASC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(entrada.limite, offset);

    const countSql = `SELECT COUNT(*) AS total ${fullWhere}`;
    const countParams = params.slice(0, idx - 1);

    const countResult = await this.ds.query<FilaConteo[]>(
      countSql,
      countParams,
    );
    const rows = await this.ds.query<FilaDocenteResumen[]>(selectSql, params);

    const total = Number.parseInt(countResult[0]?.total ?? '0', 10);
    const datos: DocenteResumen[] = rows.map((row) => ({
      id: row.id,
      codigo: row.codigo,
      estado: row.estado,
      persona: {
        id: row.persona_id,
        nombres: row.persona_nombres,
        apellidoPaterno: row.persona_apellido_paterno ?? null,
        apellidoMaterno: row.persona_apellido_materno ?? null,
      },
      sedePrincipal: row.sede_principal ?? null,
      especialidadPrincipal: row.especialidad_principal ?? null,
    }));

    return { datos, total };
  }

  async obtener(
    id: string,
    alcance: AlcanceAcceso,
  ): Promise<FichaDocente | null> {
    if (alcance.ambito === 'SEDE' && alcance.sedeId) {
      const tieneAsignacion = await this.ds.query<{ existe: boolean }[]>(
        `SELECT EXISTS (
          SELECT 1 FROM asignaciones_docente_sede
          WHERE id_docente = $1 AND id_sede = $2 AND estado = 'ACTIVA'
        ) AS existe`,
        [id, alcance.sedeId],
      );
      if (!tieneAsignacion[0]?.existe) {
        return null;
      }
    }

    const rows = await this.ds.query<FilaDocenteDetalle[]>(
      `SELECT
        d.id, d.codigo, d.estado, d.fecha_ingreso, d.fecha_cese,
        d.perfil_profesional, d.observacion,
        p.id AS pid, p.nombres, p.apellido_paterno, p.apellido_materno,
        (
          SELECT json_agg(di)
          FROM (
            SELECT
              di2.id_tipo_documento AS tipo_documento,
              tdi.codigo AS tipo_codigo,
              di2.numero
            FROM documentos_identidad_persona di2
            JOIN tipos_documento_identidad tdi ON tdi.id = di2.id_tipo_documento
            WHERE di2.id_persona = p.id AND di2.es_principal = true
              AND di2.estado = 'ACTIVO' AND di2.id_institucion_educativa = $2
            LIMIT 1
          ) di
        ) AS doc_principal,
        EXISTS (
          SELECT 1 FROM membresias_institucion mi
          JOIN usuarios u ON u.id = mi.id_usuario
          WHERE mi.id_persona = p.id
            AND mi.id_institucion_educativa = $2
            AND mi.estado = 'ACTIVA'
        ) AS tiene_cuenta
      FROM docentes d
      JOIN personas p ON p.id = d.id_persona
      WHERE d.id = $1 AND d.id_institucion_educativa = $2`,
      [id, alcance.institucionId],
    );

    if (!rows.length) return null;

    const row = rows[0];
    const sedes = await this.obtenerSedesDocente(id, alcance);
    const especialidades = await this.obtenerEspecialidadesDocente(
      id,
      alcance.institucionId,
    );

    const docPpal =
      row.doc_principal && row.doc_principal.length > 0
        ? row.doc_principal[0]
        : null;

    return {
      docente: {
        id: row.id,
        codigo: row.codigo,
        estado: row.estado,
        fechaIngreso: row.fecha_ingreso ?? null,
        fechaCese: row.fecha_cese ?? null,
        perfilProfesional: row.perfil_profesional ?? null,
        observacion: row.observacion ?? null,
      },
      persona: {
        id: row.pid,
        nombres: row.nombres,
        apellidoPaterno: row.apellido_paterno ?? null,
        apellidoMaterno: row.apellido_materno ?? null,
        documentoPrincipal: docPpal
          ? { tipo: docPpal.tipo_codigo, numero: docPpal.numero }
          : null,
      },
      sedes,
      especialidades,
      situacionCuenta: row.tiene_cuenta ? 'TIENE_CUENTA' : 'SIN_CUENTA',
    };
  }

  private async obtenerSedesDocente(
    idDocente: string,
    alcance: AlcanceAcceso,
  ): Promise<FichaDocente['sedes']> {
    let sql = `SELECT
        ads.id, ads.id_sede, s.nombre AS nombre_sede,
        ads.es_principal, ads.estado, ads.fecha_inicio, ads.fecha_fin
      FROM asignaciones_docente_sede ads
      JOIN sedes s ON s.id = ads.id_sede
      WHERE ads.id_docente = $1 AND ads.id_institucion_educativa = $2`;
    const params: unknown[] = [idDocente, alcance.institucionId];

    if (alcance.ambito === 'SEDE' && alcance.sedeId) {
      sql += ` AND ads.id_sede = $3`;
      params.push(alcance.sedeId);
    }

    sql += ` ORDER BY ads.es_principal DESC, ads.fecha_inicio DESC`;
    const rows = await this.ds.query<FilaAsignacionSede[]>(sql, params);
    return rows.map((r) => ({
      id: r.id,
      idSede: r.id_sede,
      nombreSede: r.nombre_sede,
      esPrincipal: r.es_principal,
      estado: r.estado,
      fechaInicio: r.fecha_inicio,
      fechaFin: r.fecha_fin ?? null,
    }));
  }

  private async obtenerEspecialidadesDocente(
    idDocente: string,
    institucionId: string,
  ): Promise<FichaDocente['especialidades']> {
    const rows = await this.ds.query<FilaAsignacionEspecialidad[]>(
      `SELECT
        dep.id, dep.id_especialidad_profesional, ep.nombre AS nombre_especialidad,
        dep.es_principal, dep.anios_experiencia, dep.estado
      FROM docentes_especialidades_profesionales dep
      JOIN especialidades_profesionales ep ON ep.id = dep.id_especialidad_profesional
      WHERE dep.id_docente = $1 AND dep.id_institucion_educativa = $2
      ORDER BY dep.es_principal DESC, ep.nombre ASC`,
      [idDocente, institucionId],
    );
    return rows.map((r) => ({
      id: r.id,
      idEspecialidad: r.id_especialidad_profesional,
      nombreEspecialidad: r.nombre_especialidad,
      esPrincipal: r.es_principal,
      aniosExperiencia: r.anios_experiencia ?? null,
      estado: r.estado,
    }));
  }

  async obtenerPorPersona(
    idPersona: string,
    institucionId: string,
  ): Promise<FichaDocente | null> {
    const rows = await this.ds.query<FilaIdDocente[]>(
      `SELECT d.id FROM docentes d
       WHERE d.id_persona = $1 AND d.id_institucion_educativa = $2
       LIMIT 1`,
      [idPersona, institucionId],
    );
    if (!rows.length) return null;

    return this.obtener(rows[0].id, {
      usuarioId: '',
      institucionId,
      ambito: 'INSTITUCION',
      sedeId: null,
    });
  }

  async obtenerPorUsuario(
    alcance: AlcanceAcceso,
  ): Promise<FichaDocente | null> {
    const rows = await this.ds.query<FilaIdDocente[]>(
      `SELECT d.id FROM docentes d
       JOIN membresias_institucion mi ON mi.id_persona = d.id_persona
         AND mi.id_institucion_educativa = d.id_institucion_educativa
         AND mi.estado = 'ACTIVA'
       WHERE mi.id_usuario = $1
         AND d.id_institucion_educativa = $2
       LIMIT 1`,
      [alcance.usuarioId, alcance.institucionId],
    );
    if (!rows.length) return null;

    return this.obtener(rows[0].id, alcance);
  }

  async listarEspecialidades(
    institucionId: string,
    estado?: string | null,
  ): Promise<EspecialidadProfesionalResumen[]> {
    let sql = `
      SELECT id, codigo, nombre, estado
      FROM especialidades_profesionales
      WHERE id_institucion_educativa = $1
    `;
    const params: unknown[] = [institucionId];

    if (estado) {
      sql += ` AND estado = $2`;
      params.push(estado);
    }

    sql += ` ORDER BY nombre ASC`;

    const rows = await this.ds.query<FilaEspecialidadResumen[]>(sql, params);
    return rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      estado: r.estado,
    }));
  }
}
