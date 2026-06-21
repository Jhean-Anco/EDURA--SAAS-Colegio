import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EstadoCalendario,
  RepositorioCalendarioAcademico,
  TipoPeriodo,
} from '../../../../dominio/puertos/estructura-academica.puerto';

interface FilaId {
  id: string;
}

interface FilaEstadoAnio {
  id: string;
  estado: string;
  anio: number;
}

interface FilaEstadoPeriodo {
  id: string;
  estado: string;
}

interface FilaConteo {
  total: string;
}

@Injectable()
export class RepositorioCalendarioAcademicoTypeorm implements RepositorioCalendarioAcademico {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async existeAnioEnInstitucion(
    anio: number,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM anios_academicos
       WHERE id_institucion_educativa = $1 AND anio = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [institucionId, anio, excluirId ?? null],
    );
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeCodigoAnioEnInstitucion(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM anios_academicos
       WHERE id_institucion_educativa = $1 AND codigo_normalizado = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [institucionId, codigoNormalizado, excluirId ?? null],
    );
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeAnioActivo(institucionId: string): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM anios_academicos
       WHERE id_institucion_educativa = $1 AND estado = 'ACTIVO'`,
      [institucionId],
    );
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async crearAnioAcademico(entrada: {
    institucionId: string;
    anio: number;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    observacion?: string | null;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<FilaId[]>(
      `INSERT INTO anios_academicos
         (id_institucion_educativa, anio, codigo, codigo_normalizado, nombre, fecha_inicio, fecha_fin, observacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.anio,
        entrada.codigo,
        entrada.codigoNormalizado,
        entrada.nombre,
        entrada.fechaInicio,
        entrada.fechaFin,
        entrada.observacion ?? null,
      ],
    );
    return { id: rows[0].id };
  }

  async obtenerAnioBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoCalendario; anio: number } | null> {
    const rows = await this.ds.query<FilaEstadoAnio[]>(
      `SELECT id, estado, anio FROM anios_academicos
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId],
    );
    if (!rows.length) return null;
    const r = rows[0];
    return { id: r.id, estado: r.estado as EstadoCalendario, anio: r.anio };
  }

  async actualizarAnioAcademico(entrada: {
    id: string;
    institucionId: string;
    nombre?: string;
    fechaInicio?: string;
    fechaFin?: string;
    observacion?: string | null;
  }): Promise<boolean> {
    const sets: string[] = ['fecha_modificacion = now()'];
    const params: unknown[] = [entrada.id, entrada.institucionId];
    let idx = 3;
    if (entrada.nombre !== undefined) {
      sets.push(`nombre = $${idx++}`);
      params.push(entrada.nombre);
    }
    if (entrada.fechaInicio !== undefined) {
      sets.push(`fecha_inicio = $${idx++}`);
      params.push(entrada.fechaInicio);
    }
    if (entrada.fechaFin !== undefined) {
      sets.push(`fecha_fin = $${idx++}`);
      params.push(entrada.fechaFin);
    }
    if (entrada.observacion !== undefined) {
      sets.push(`observacion = $${idx++}`);
      params.push(entrada.observacion);
    }
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE anios_academicos SET ${sets.join(', ')}
       WHERE id = $1 AND id_institucion_educativa = $2`,
      params,
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async cambiarEstadoAnio(
    id: string,
    institucionId: string,
    estado: EstadoCalendario,
  ): Promise<boolean> {
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE anios_academicos SET estado = $3, fecha_modificacion = now()
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId, estado],
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async existePeriodoActivoEnAnio(
    idAnio: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM periodos_academicos
       WHERE id_anio_academico = $1 AND id_institucion_educativa = $2
         AND estado = 'ACTIVO'`,
      [idAnio, institucionId],
    );
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeCodigoPeriodoEnAnio(
    codigoNormalizado: string,
    idAnio: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM periodos_academicos
       WHERE id_anio_academico = $1 AND id_institucion_educativa = $2
         AND codigo_normalizado = $3 AND ($4::uuid IS NULL OR id <> $4)`,
      [idAnio, institucionId, codigoNormalizado, excluirId ?? null],
    );
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeOrdenPeriodoEnAnio(
    orden: number,
    idAnio: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM periodos_academicos
       WHERE id_anio_academico = $1 AND id_institucion_educativa = $2
         AND orden = $3 AND ($4::uuid IS NULL OR id <> $4)`,
      [idAnio, institucionId, orden, excluirId ?? null],
    );
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeSolapamientoPeriodo(entrada: {
    idAnio: string;
    institucionId: string;
    fechaInicio: string;
    fechaFin: string;
    excluirId?: string;
  }): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM periodos_academicos
       WHERE id_anio_academico = $1 AND id_institucion_educativa = $2
         AND estado NOT IN ('CERRADO', 'ANULADO')
         AND fecha_inicio < $4::date AND fecha_fin > $3::date
         AND ($5::uuid IS NULL OR id <> $5)`,
      [
        entrada.idAnio,
        entrada.institucionId,
        entrada.fechaInicio,
        entrada.fechaFin,
        entrada.excluirId ?? null,
      ],
    );
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async crearPeriodoAcademico(entrada: {
    institucionId: string;
    idAnioAcademico: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    tipo: TipoPeriodo;
    orden: number;
    fechaInicio: string;
    fechaFin: string;
    observacion?: string | null;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<FilaId[]>(
      `INSERT INTO periodos_academicos
         (id_institucion_educativa, id_anio_academico, codigo, codigo_normalizado, nombre, tipo, orden,
          fecha_inicio, fecha_fin, observacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.idAnioAcademico,
        entrada.codigo,
        entrada.codigoNormalizado,
        entrada.nombre,
        entrada.tipo,
        entrada.orden,
        entrada.fechaInicio,
        entrada.fechaFin,
        entrada.observacion ?? null,
      ],
    );
    return { id: rows[0].id };
  }

  async obtenerPeriodoBase(
    id: string,
    idAnio: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoCalendario } | null> {
    const rows = await this.ds.query<FilaEstadoPeriodo[]>(
      `SELECT id, estado FROM periodos_academicos
       WHERE id = $1 AND id_anio_academico = $2 AND id_institucion_educativa = $3`,
      [id, idAnio, institucionId],
    );
    if (!rows.length) return null;
    const r = rows[0];
    return { id: r.id, estado: r.estado as EstadoCalendario };
  }

  async actualizarPeriodoAcademico(entrada: {
    id: string;
    idAnioAcademico: string;
    institucionId: string;
    nombre?: string;
    tipo?: TipoPeriodo;
    orden?: number;
    fechaInicio?: string;
    fechaFin?: string;
    observacion?: string | null;
  }): Promise<boolean> {
    const sets: string[] = ['fecha_modificacion = now()'];
    const params: unknown[] = [
      entrada.id,
      entrada.idAnioAcademico,
      entrada.institucionId,
    ];
    let idx = 4;
    if (entrada.nombre !== undefined) {
      sets.push(`nombre = $${idx++}`);
      params.push(entrada.nombre);
    }
    if (entrada.tipo !== undefined) {
      sets.push(`tipo = $${idx++}`);
      params.push(entrada.tipo);
    }
    if (entrada.orden !== undefined) {
      sets.push(`orden = $${idx++}`);
      params.push(entrada.orden);
    }
    if (entrada.fechaInicio !== undefined) {
      sets.push(`fecha_inicio = $${idx++}`);
      params.push(entrada.fechaInicio);
    }
    if (entrada.fechaFin !== undefined) {
      sets.push(`fecha_fin = $${idx++}`);
      params.push(entrada.fechaFin);
    }
    if (entrada.observacion !== undefined) {
      sets.push(`observacion = $${idx++}`);
      params.push(entrada.observacion);
    }
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE periodos_academicos SET ${sets.join(', ')}
       WHERE id = $1 AND id_anio_academico = $2 AND id_institucion_educativa = $3`,
      params,
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async cambiarEstadoPeriodo(
    id: string,
    idAnio: string,
    institucionId: string,
    estado: EstadoCalendario,
  ): Promise<boolean> {
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE periodos_academicos SET estado = $4, fecha_modificacion = now()
       WHERE id = $1 AND id_anio_academico = $2 AND id_institucion_educativa = $3`,
      [id, idAnio, institucionId, estado],
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }
}
