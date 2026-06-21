import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EstadoPlan,
  EstadoDetalle,
  TipoDetalle,
  RepositorioPlanesEstudio,
} from '../../../../dominio/puertos/curriculo.puerto';

interface FilaConteo {
  total: string;
}

interface FilaPlanBase {
  id: string;
  estado: string;
  id_anio_academico: string;
  id_grado_educativo: string;
}

interface FilaDetalleBase {
  id: string;
  estado: string;
  id_plan_estudio: string;
}

interface FilaId {
  id: string;
}

@Injectable()
export class RepositorioPlanesEstudioTypeorm implements RepositorioPlanesEstudio {
  constructor(@InjectDataSource() private readonly ds: DataSource) { }

  async existeAnioEnInstitucion(idAnio: string, institucionId: string): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM anios_academicos
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [idAnio, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeGradoEnInstitucion(idGrado: string, institucionId: string): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM grados_educativos
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [idGrado, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async obtenerEstadoAnio(idAnio: string, institucionId: string): Promise<string | null> {
    const rows = await this.ds.query<{ estado: string }[]>(
      `SELECT estado FROM anios_academicos
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [idAnio, institucionId],
    );
    return rows[0]?.estado ?? null;
  }

  async existeCodigoPlanEnInstitucion(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM planes_estudio
       WHERE id_institucion_educativa = $1 AND codigo_normalizado = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [institucionId, codigoNormalizado, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeVersionPlanEnAnioGrado(
    version: number,
    idAnio: string,
    idGrado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM planes_estudio
       WHERE id_institucion_educativa = $1 AND id_anio_academico = $2
         AND id_grado_educativo = $3 AND version = $4
         AND ($5::uuid IS NULL OR id <> $5)`,
      [institucionId, idAnio, idGrado, version, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }
  async obtenerSiguienteVersionPlan(
    idAnio: string,
    idGrado: string,
    institucionId: string,
  ): Promise<number> {
    const rows = await this.ds.query<{ max_version: number | null }[]>(
      `SELECT MAX(version) AS max_version FROM planes_estudio
       WHERE id_institucion_educativa = $1 AND id_anio_academico = $2 AND id_grado_educativo = $3`,
      [institucionId, idAnio, idGrado],
    );
    const maxVal = rows[0]?.max_version ?? 0;
    return maxVal + 1;
  }
  async crearPlan(entrada: {
    institucionId: string;
    idAnioAcademico: string;
    idGradoEducativo: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    version: number;
    observacion?: string | null;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<FilaId[]>(
      `INSERT INTO planes_estudio
         (id_institucion_educativa, id_anio_academico, id_grado_educativo,
          codigo, codigo_normalizado, nombre, version, estado, observacion,
          fecha_creacion, fecha_modificacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'BORRADOR',$8,now(),now())
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.idAnioAcademico,
        entrada.idGradoEducativo,
        entrada.codigo,
        entrada.codigoNormalizado,
        entrada.nombre,
        entrada.version,
        entrada.observacion ?? null,
      ],
    );
    return { id: rows[0]!.id };
  }

  async obtenerPlanBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoPlan; idAnioAcademico: string; idGradoEducativo: string } | null> {
    const rows = await this.ds.query<FilaPlanBase[]>(
      `SELECT id, estado, id_anio_academico, id_grado_educativo FROM planes_estudio
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      estado: row.estado as EstadoPlan,
      idAnioAcademico: row.id_anio_academico,
      idGradoEducativo: row.id_grado_educativo,
    };
  }

  async actualizarPlan(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    observacion?: string | null;
  }): Promise<boolean> {
    const sets: string[] = ['fecha_modificacion = now()'];
    const params: unknown[] = [entrada.id, entrada.institucionId];
    let i = 3;
    if (entrada.codigo !== undefined) { sets.push(`codigo = $${i++}`); params.push(entrada.codigo); }
    if (entrada.codigoNormalizado !== undefined) { sets.push(`codigo_normalizado = $${i++}`); params.push(entrada.codigoNormalizado); }
    if (entrada.nombre !== undefined) { sets.push(`nombre = $${i++}`); params.push(entrada.nombre); }
    if (entrada.observacion !== undefined) { sets.push(`observacion = $${i++}`); params.push(entrada.observacion); }
    const result = await this.ds.query<FilaId[]>(
      `UPDATE planes_estudio SET ${sets.join(', ')}
       WHERE id = $1 AND id_institucion_educativa = $2 RETURNING id`,
      params,
    );
    return result.length > 0;
  }

  async cambiarEstadoPlan(
    id: string,
    institucionId: string,
    estado: EstadoPlan,
    aprobacion?: { fechaAprobacion: string; idUsuarioAprobador: string },
    activacion?: { fechaVigencia: string; idUsuarioActivador: string },
  ): Promise<boolean> {
    let sql: string;
    let params: unknown[];
    if (aprobacion) {
      sql = `UPDATE planes_estudio
             SET estado = $3, fecha_aprobacion = $4, id_usuario_aprobador = $5,
                 fecha_modificacion = now()
             WHERE id = $1 AND id_institucion_educativa = $2 RETURNING id`;
      params = [id, institucionId, estado, aprobacion.fechaAprobacion, aprobacion.idUsuarioAprobador];
    } else if (activacion) {
      sql = `UPDATE planes_estudio
             SET estado = $3, fecha_vigencia = $4, id_usuario_activador = $5,
                 fecha_modificacion = now()
             WHERE id = $1 AND id_institucion_educativa = $2 RETURNING id`;
      params = [id, institucionId, estado, activacion.fechaVigencia, activacion.idUsuarioActivador];
    } else {
      sql = `UPDATE planes_estudio SET estado = $3, fecha_modificacion = now()
             WHERE id = $1 AND id_institucion_educativa = $2 RETURNING id`;
      params = [id, institucionId, estado];
    }
    const result = await this.ds.query<FilaId[]>(sql, params);
    return result.length > 0;
  }

  async existePlanVigenteParaAnioGrado(
    idAnio: string,
    idGrado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM planes_estudio
       WHERE id_institucion_educativa = $1 AND id_anio_academico = $2
         AND id_grado_educativo = $3 AND estado = 'VIGENTE'
         AND ($4::uuid IS NULL OR id <> $4)`,
      [institucionId, idAnio, idGrado, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async contarDetallesActivos(idPlan: string, institucionId: string): Promise<number> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM detalles_plan_estudio
       WHERE id_plan_estudio = $1 AND id_institucion_educativa = $2 AND estado = 'ACTIVO'`,
      [idPlan, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10);
  }

  async tieneAsignaturasInactivasEnDetalle(idPlan: string, institucionId: string): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total
       FROM detalles_plan_estudio d
       JOIN asignaturas a ON a.id = d.id_asignatura
         AND a.id_institucion_educativa = d.id_institucion_educativa
       WHERE d.id_plan_estudio = $1 AND d.id_institucion_educativa = $2
         AND d.estado = 'ACTIVO' AND a.estado = 'INACTIVA'`,
      [idPlan, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeAsignaturaEnPlan(
    idAsignatura: string,
    idPlan: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM detalles_plan_estudio
       WHERE id_plan_estudio = $1 AND id_asignatura = $2
         AND estado = 'ACTIVO'
         AND ($3::uuid IS NULL OR id <> $3)`,
      [idPlan, idAsignatura, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeOrdenDetalleEnPlan(
    orden: number,
    idPlan: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM detalles_plan_estudio
       WHERE id_plan_estudio = $1 AND orden = $2
         AND estado = 'ACTIVO'
         AND ($3::uuid IS NULL OR id <> $3)`,
      [idPlan, orden, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async agregarDetalle(entrada: {
    institucionId: string;
    idPlanEstudio: string;
    idAsignatura: string;
    tipo: TipoDetalle;
    horasSemanales: number;
    horasAnuales: number;
    orden: number;
    observacion?: string | null;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<FilaId[]>(
      `INSERT INTO detalles_plan_estudio
         (id_institucion_educativa, id_plan_estudio, id_asignatura, tipo,
          horas_semanales, horas_anuales, orden, estado, observacion,
          fecha_creacion, fecha_modificacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'ACTIVO',$8,now(),now())
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.idPlanEstudio,
        entrada.idAsignatura,
        entrada.tipo,
        entrada.horasSemanales,
        entrada.horasAnuales,
        entrada.orden,
        entrada.observacion ?? null,
      ],
    );
    return { id: rows[0]!.id };
  }

  async obtenerDetalleBase(
    id: string,
    idPlan: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoDetalle; idPlanEstudio: string } | null> {
    const rows = await this.ds.query<FilaDetalleBase[]>(
      `SELECT id, estado, id_plan_estudio FROM detalles_plan_estudio
       WHERE id = $1 AND id_plan_estudio = $2 AND id_institucion_educativa = $3`,
      [id, idPlan, institucionId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      estado: row.estado as EstadoDetalle,
      idPlanEstudio: row.id_plan_estudio,
    };
  }

  async actualizarDetalle(entrada: {
    id: string;
    institucionId: string;
    tipo?: TipoDetalle;
    horasSemanales?: number;
    horasAnuales?: number;
    orden?: number;
    observacion?: string | null;
  }): Promise<boolean> {
    const sets: string[] = ['fecha_modificacion = now()'];
    const params: unknown[] = [entrada.id, entrada.institucionId];
    let i = 3;
    if (entrada.tipo !== undefined) { sets.push(`tipo = $${i++}`); params.push(entrada.tipo); }
    if (entrada.horasSemanales !== undefined) { sets.push(`horas_semanales = $${i++}`); params.push(entrada.horasSemanales); }
    if (entrada.horasAnuales !== undefined) { sets.push(`horas_anuales = $${i++}`); params.push(entrada.horasAnuales); }
    if (entrada.orden !== undefined) { sets.push(`orden = $${i++}`); params.push(entrada.orden); }
    if (entrada.observacion !== undefined) { sets.push(`observacion = $${i++}`); params.push(entrada.observacion); }
    const result = await this.ds.query<FilaId[]>(
      `UPDATE detalles_plan_estudio SET ${sets.join(', ')}
       WHERE id = $1 AND id_institucion_educativa = $2 RETURNING id`,
      params,
    );
    return result.length > 0;
  }

  async cambiarEstadoDetalle(
    id: string,
    idPlan: string,
    institucionId: string,
    estado: EstadoDetalle,
  ): Promise<boolean> {
    const result = await this.ds.query<FilaId[]>(
      `UPDATE detalles_plan_estudio SET estado = $4, fecha_modificacion = now()
       WHERE id = $1 AND id_plan_estudio = $2 AND id_institucion_educativa = $3 RETURNING id`,
      [id, idPlan, institucionId, estado],
    );
    return result.length > 0;
  }

  async duplicarPlan(entrada: {
    idPlanOrigen: string;
    institucionId: string;
    idAnioAcademico: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    version: number;
    observacion?: string | null;
  }): Promise<{ id: string }> {
    // Insert nuevo plan
    const planRows = await this.ds.query<FilaId[]>(
      `INSERT INTO planes_estudio
         (id_institucion_educativa, id_anio_academico, id_grado_educativo,
          codigo, codigo_normalizado, nombre, version, estado, observacion,
          fecha_creacion, fecha_modificacion)
       SELECT $2, $3, id_grado_educativo, $4, $5, $6, $7, 'BORRADOR', $8, now(), now()
       FROM planes_estudio
       WHERE id = $1 AND id_institucion_educativa = $2
       RETURNING id`,
      [
        entrada.idPlanOrigen,
        entrada.institucionId,
        entrada.idAnioAcademico,
        entrada.codigo,
        entrada.codigoNormalizado,
        entrada.nombre,
        entrada.version,
        entrada.observacion ?? null,
      ],
    );
    const idNuevo = planRows[0]!.id;

    // Copiar detalles activos
    await this.ds.query(
      `INSERT INTO detalles_plan_estudio
         (id_institucion_educativa, id_plan_estudio, id_asignatura, tipo,
          horas_semanales, horas_anuales, orden, estado, observacion,
          fecha_creacion, fecha_modificacion)
       SELECT id_institucion_educativa, $2, id_asignatura, tipo,
              horas_semanales, horas_anuales, orden, 'ACTIVO', observacion,
              now(), now()
       FROM detalles_plan_estudio
       WHERE id_plan_estudio = $1 AND id_institucion_educativa = $3 AND estado = 'ACTIVO'`,
      [entrada.idPlanOrigen, idNuevo, entrada.institucionId],
    );

    return { id: idNuevo };
  }
}
