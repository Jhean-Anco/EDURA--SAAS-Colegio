import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EstadoOferta,
  EstadoSeccion,
  RepositorioOfertaAcademica,
} from '../../../../dominio/puertos/estructura-academica.puerto';

interface FilaId {
  id: string;
}

interface FilaConteo {
  total: string;
}

interface FilaEstadoOferta {
  id: string;
  estado: string;
  id_sede: string;
}

interface FilaEstadoSeccion {
  id: string;
  estado: string;
  id_oferta_grado_sede: string;
  id_sede: string;
}

@Injectable()
export class RepositorioOfertaAcademicaTypeorm implements RepositorioOfertaAcademica {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async existeOfertaEnSede(entrada: {
    idSede: string;
    idGrado: string;
    idAnio: string;
    institucionId: string;
    excluirId?: string;
  }): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM ofertas_grado_sede
       WHERE id_institucion_educativa = $1 AND id_sede = $2
         AND id_grado_educativo = $3 AND id_anio_academico = $4
         AND ($5::uuid IS NULL OR id <> $5)`,
      [
        entrada.institucionId,
        entrada.idSede,
        entrada.idGrado,
        entrada.idAnio,
        entrada.excluirId ?? null,
      ],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async crearOfertaGradoSede(entrada: {
    institucionId: string;
    idSede: string;
    idGradoEducativo: string;
    idAnioAcademico: string;
    capacidadReferencial?: number | null;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<FilaId[]>(
      `INSERT INTO ofertas_grado_sede
         (id_institucion_educativa, id_sede, id_grado_educativo,
          id_anio_academico, capacidad_referencial)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.idSede,
        entrada.idGradoEducativo,
        entrada.idAnioAcademico,
        entrada.capacidadReferencial ?? null,
      ],
    );
    return { id: rows[0].id };
  }

  async obtenerOfertaBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoOferta; idSede: string } | null> {
    const rows = await this.ds.query<FilaEstadoOferta[]>(
      `SELECT id, estado, id_sede FROM ofertas_grado_sede
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId],
    );
    if (!rows.length) return null;
    const r = rows[0];
    return { id: r.id, estado: r.estado as EstadoOferta, idSede: r.id_sede };
  }

  async actualizarOferta(entrada: {
    id: string;
    institucionId: string;
    capacidadReferencial?: number | null;
    estado?: EstadoOferta;
  }): Promise<boolean> {
    const sets: string[] = ['fecha_modificacion = now()'];
    const params: unknown[] = [entrada.id, entrada.institucionId];
    let idx = 3;
    if (entrada.capacidadReferencial !== undefined) {
      sets.push(`capacidad_referencial = $${idx++}`);
      params.push(entrada.capacidadReferencial);
    }
    if (entrada.estado !== undefined) {
      sets.push(`estado = $${idx++}`);
      params.push(entrada.estado);
    }
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE ofertas_grado_sede SET ${sets.join(', ')}
       WHERE id = $1 AND id_institucion_educativa = $2`,
      params,
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async cambiarEstadoOferta(
    id: string,
    institucionId: string,
    estado: EstadoOferta,
  ): Promise<boolean> {
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE ofertas_grado_sede SET estado = $3, fecha_modificacion = now()
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId, estado],
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async tieneSeccionesActivasEnOferta(
    idOferta: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM secciones_academicas
       WHERE id_oferta_grado_sede = $1 AND id_institucion_educativa = $2
         AND estado = 'ACTIVA'`,
      [idOferta, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeOfertaActivaOPlanificadaEnAnio(
    idAnio: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM ofertas_grado_sede
       WHERE id_anio_academico = $1 AND id_institucion_educativa = $2
         AND estado IN ('ACTIVA', 'PLANIFICADA')`,
      [idAnio, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeSeccionEnOferta(
    codigoNormalizado: string,
    idOferta: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM secciones_academicas
       WHERE id_oferta_grado_sede = $1 AND id_institucion_educativa = $2
         AND codigo_normalizado = $3
         AND ($4::uuid IS NULL OR id <> $4)`,
      [idOferta, institucionId, codigoNormalizado, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async crearSeccionAcademica(entrada: {
    institucionId: string;
    idOfertaGradoSede: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    turno: string;
    capacidadMaxima: number;
    idDocenteTutor?: string | null;
    idEspacioFisico?: string | null;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<FilaId[]>(
      `INSERT INTO secciones_academicas
         (id_institucion_educativa, id_oferta_grado_sede, codigo, codigo_normalizado, nombre, turno,
          capacidad_maxima, estado, id_docente_tutor, id_espacio_fisico)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PLANIFICADA', $8, $9)
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.idOfertaGradoSede,
        entrada.codigo,
        entrada.codigoNormalizado,
        entrada.nombre,
        entrada.turno,
        entrada.capacidadMaxima,
        entrada.idDocenteTutor ?? null,
        entrada.idEspacioFisico ?? null,
      ],
    );
    return { id: rows[0].id };
  }

  async obtenerSeccionBase(
    id: string,
    institucionId: string,
  ): Promise<{
    id: string;
    estado: EstadoSeccion;
    idOfertaGradoSede: string;
    idSede: string;
    capacidadMaxima: number | null;
  } | null> {
    const rows = await this.ds.query<
      (FilaEstadoSeccion & { capacidad_maxima: number | null })[]
    >(
      `SELECT sa.id, sa.estado, sa.id_oferta_grado_sede, ogs.id_sede, sa.capacidad_maxima
       FROM secciones_academicas sa
       JOIN ofertas_grado_sede ogs ON ogs.id = sa.id_oferta_grado_sede
       WHERE sa.id = $1 AND sa.id_institucion_educativa = $2`,
      [id, institucionId],
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      estado: r.estado as EstadoSeccion,
      idOfertaGradoSede: r.id_oferta_grado_sede,
      idSede: r.id_sede,
      capacidadMaxima: r.capacidad_maxima,
    };
  }

  async actualizarSeccion(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    turno?: string;
    capacidadMaxima?: number | null;
    idDocenteTutor?: string | null;
    idEspacioFisico?: string | null;
    estado?: EstadoSeccion;
  }): Promise<boolean> {
    const sets: string[] = ['fecha_modificacion = now()'];
    const params: unknown[] = [entrada.id, entrada.institucionId];
    let idx = 3;
    if (entrada.codigo !== undefined) {
      sets.push(`codigo = $${idx++}`);
      params.push(entrada.codigo);
    }
    if (entrada.codigoNormalizado !== undefined) {
      sets.push(`codigo_normalizado = $${idx++}`);
      params.push(entrada.codigoNormalizado);
    }
    if (entrada.nombre !== undefined) {
      sets.push(`nombre = $${idx++}`);
      params.push(entrada.nombre);
    }
    if (entrada.turno !== undefined) {
      sets.push(`turno = $${idx++}`);
      params.push(entrada.turno);
    }
    if (entrada.capacidadMaxima !== undefined) {
      sets.push(`capacidad_maxima = $${idx++}`);
      params.push(entrada.capacidadMaxima);
    }
    if (entrada.idDocenteTutor !== undefined) {
      sets.push(`id_docente_tutor = $${idx++}`);
      params.push(entrada.idDocenteTutor);
    }
    if (entrada.idEspacioFisico !== undefined) {
      sets.push(`id_espacio_fisico = $${idx++}`);
      params.push(entrada.idEspacioFisico);
    }
    if (entrada.estado !== undefined) {
      sets.push(`estado = $${idx++}`);
      params.push(entrada.estado);
    }
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE secciones_academicas SET ${sets.join(', ')}
       WHERE id = $1 AND id_institucion_educativa = $2`,
      params,
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async cambiarEstadoSeccion(
    id: string,
    institucionId: string,
    estado: EstadoSeccion,
  ): Promise<boolean> {
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE secciones_academicas SET estado = $3, fecha_modificacion = now()
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId, estado],
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async verificarEspacioFisicoEnSede(
    idEspacioFisico: string,
    idSede: string,
  ): Promise<{
    esAula: boolean;
    estaActivo: boolean;
    aforo: number | null;
  } | null> {
    const rows = await this.ds.query<
      { estado: string; aforo: number | null; tipo_codigo: string }[]
    >(
      `SELECT ei.estado, ef.aforo, tef.codigo AS tipo_codigo
       FROM elementos_infraestructura ei
       JOIN espacios_fisicos ef ON ef.id_elemento_infraestructura = ei.id
       JOIN tipos_espacio_fisico tef ON tef.id = ef.id_tipo_espacio_fisico
       WHERE ei.id = $1 AND ei.id_sede = $2`,
      [idEspacioFisico, idSede],
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      esAula: r.tipo_codigo === 'AULA',
      estaActivo: r.estado === 'ACTIVO',
      aforo: r.aforo,
    };
  }

  async verificarDocenteTutorEnSede(
    idDocente: string,
    idSede: string,
    institucionId: string,
  ): Promise<{
    estaActivo: boolean;
    estaCesado: boolean;
    tieneAsignacion: boolean;
  }> {
    // Check docente status
    const docenteRows = await this.ds.query<{ estado: string }[]>(
      `SELECT estado FROM docentes
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [idDocente, institucionId],
    );
    if (!docenteRows.length) {
      return { estaActivo: false, estaCesado: false, tieneAsignacion: false };
    }
    const docente = docenteRows[0];
    const estaActivo = docente.estado === 'ACTIVO';
    const estaCesado = docente.estado === 'CESADO';

    // Check sede assignment
    const asignacionRows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM asignaciones_docente_sede
       WHERE id_docente = $1 AND id_sede = $2 AND id_institucion_educativa = $3 AND estado = 'ACTIVA'`,
      [idDocente, idSede, institucionId],
    );
    const tieneAsignacion = parseInt(asignacionRows[0]?.total ?? '0', 10) > 0;

    return { estaActivo, estaCesado, tieneAsignacion };
  }
}
