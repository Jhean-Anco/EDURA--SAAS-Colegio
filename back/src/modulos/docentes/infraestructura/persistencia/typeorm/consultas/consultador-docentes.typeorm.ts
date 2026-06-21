import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AlcanceAcceso,
  ConsultadorDocentes,
  DocenteResumen,
  EspecialidadProfesionalResumen,
  FichaDocente,
} from '../../../../dominio/puertos/docentes.puerto';

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

    const countResult: Array<{ total: string }> = await this.ds.query(
      countSql,
      countParams,
    );
    const rows: Array<Record<string, unknown>> = await this.ds.query(
      selectSql,
      params,
    );

    const total = Number.parseInt(countResult[0]?.total ?? '0', 10);
    const datos: DocenteResumen[] = rows.map((row) => ({
      id: row.id as string,
      codigo: row.codigo as string,
      estado: row.estado as string,
      persona: {
        id: row.persona_id as string,
        nombres: row.persona_nombres as string,
        apellidoPaterno:
          (row.persona_apellido_paterno as string | null) ?? null,
        apellidoMaterno:
          (row.persona_apellido_materno as string | null) ?? null,
      },
      sedePrincipal:
        (row.sede_principal as { id: string; nombre: string } | null) ?? null,
      especialidadPrincipal:
        (row.especialidad_principal as {
          id: string;
          nombre: string;
        } | null) ?? null,
    }));

    return { datos, total };
  }

  async obtener(
    id: string,
    alcance: AlcanceAcceso,
  ): Promise<FichaDocente | null> {
    const rows = await this.ds.query(
      `SELECT
        d.id, d.codigo, d.estado, d.fecha_ingreso, d.fecha_cese,
        d.perfil_profesional, d.observacion,
        p.id AS pid, p.nombres, p.apellido_paterno, p.apellido_materno,
        (
          SELECT json_agg(di ORDER BY di.es_principal DESC)
          FROM (
            SELECT di2.tipo_documento AS tipo, di2.numero
            FROM documentos_identidad_persona di2
            WHERE di2.id_persona = p.id AND di2.es_principal = true
              AND di2.estado = 'ACTIVO'
            LIMIT 1
          ) di
        ) AS doc_principal,
        EXISTS (
          SELECT 1 FROM usuarios u WHERE u.id_persona = p.id
        ) AS tiene_cuenta
      FROM docentes d
      JOIN personas p ON p.id = d.id_persona
      WHERE d.id = $1 AND d.id_institucion_educativa = $2`,
      [id, alcance.institucionId],
    );

    if (!rows.length) return null;

    const row = rows[0] as Record<string, unknown>;
    const sedes = await this.obtenerSedesDocente(id);
    const especialidades = await this.obtenerEspecialidadesDocente(id);

    const docPpal = row.doc_principal
      ? (row.doc_principal as Array<{ tipo: string; numero: string }>)[0]
      : null;

    return {
      docente: {
        id: row.id as string,
        codigo: row.codigo as string,
        estado: row.estado as string,
        fechaIngreso: (row.fecha_ingreso as string) ?? null,
        fechaCese: (row.fecha_cese as string) ?? null,
        perfilProfesional: (row.perfil_profesional as string) ?? null,
        observacion: (row.observacion as string) ?? null,
      },
      persona: {
        id: row.pid as string,
        nombres: row.nombres as string,
        apellidoPaterno: (row.apellido_paterno as string) ?? null,
        apellidoMaterno: (row.apellido_materno as string) ?? null,
        documentoPrincipal: docPpal
          ? { tipo: docPpal.tipo, numero: docPpal.numero }
          : null,
      },
      sedes,
      especialidades,
      situacionCuenta: row.tiene_cuenta ? 'TIENE_CUENTA' : 'SIN_CUENTA',
    };
  }

  private async obtenerSedesDocente(
    idDocente: string,
  ): Promise<FichaDocente['sedes']> {
    const rows = await this.ds.query(
      `SELECT
        ads.id, ads.id_sede, s.nombre AS nombre_sede,
        ads.es_principal, ads.estado, ads.fecha_inicio, ads.fecha_fin
      FROM asignaciones_docente_sede ads
      JOIN sedes s ON s.id = ads.id_sede
      WHERE ads.id_docente = $1
      ORDER BY ads.es_principal DESC, ads.fecha_inicio DESC`,
      [idDocente],
    );
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      idSede: r.id_sede as string,
      nombreSede: r.nombre_sede as string,
      esPrincipal: r.es_principal as boolean,
      estado: r.estado as string,
      fechaInicio: r.fecha_inicio as string,
      fechaFin: (r.fecha_fin as string) ?? null,
    }));
  }

  private async obtenerEspecialidadesDocente(
    idDocente: string,
  ): Promise<FichaDocente['especialidades']> {
    const rows = await this.ds.query(
      `SELECT
        dep.id, dep.id_especialidad_profesional, ep.nombre AS nombre_especialidad,
        dep.es_principal, dep.anios_experiencia, dep.estado
      FROM docentes_especialidades_profesionales dep
      JOIN especialidades_profesionales ep ON ep.id = dep.id_especialidad_profesional
      WHERE dep.id_docente = $1
      ORDER BY dep.es_principal DESC, ep.nombre ASC`,
      [idDocente],
    );
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      idEspecialidad: r.id_especialidad_profesional as string,
      nombreEspecialidad: r.nombre_especialidad as string,
      esPrincipal: r.es_principal as boolean,
      aniosExperiencia: (r.anios_experiencia as number) ?? null,
      estado: r.estado as string,
    }));
  }

  async obtenerPorPersona(
    idPersona: string,
    institucionId: string,
  ): Promise<FichaDocente | null> {
    const rows = await this.ds.query(
      `SELECT d.id FROM docentes d
       WHERE d.id_persona = $1 AND d.id_institucion_educativa = $2
       LIMIT 1`,
      [idPersona, institucionId],
    );
    if (!rows.length) return null;

    return this.obtener(rows[0].id as string, {
      usuarioId: '',
      institucionId,
      ambito: 'INSTITUCION',
      sedeId: null,
    });
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

    const rows = await this.ds.query(sql, params);
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      codigo: r.codigo as string,
      nombre: r.nombre as string,
      estado: r.estado as string,
    }));
  }
}
