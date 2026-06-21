import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EstadoAsignatura,
  RepositorioAsignaturas,
} from '../../../../dominio/puertos/curriculo.puerto';

interface FilaConteo {
  total: string;
}

interface FilaAsignaturaBase {
  id: string;
  estado: string;
  id_area_curricular: string;
}

@Injectable()
export class RepositorioAsignaturasTypeorm implements RepositorioAsignaturas {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async existeAreaEnInstitucion(
    idArea: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM areas_curriculares
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [idArea, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeCodigoAsignaturaEnInstitucion(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM asignaturas
       WHERE id_institucion_educativa = $1 AND codigo_normalizado = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [institucionId, codigoNormalizado, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeOrdenAsignaturaEnArea(
    orden: number,
    idArea: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM asignaturas
       WHERE id_area_curricular = $1 AND orden = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [idArea, orden, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async crearAsignatura(entrada: {
    institucionId: string;
    idAreaCurricular: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    nombreCorto?: string | null;
    descripcion?: string | null;
    orden: number;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<{ id: string }[]>(
      `INSERT INTO asignaturas
         (id_institucion_educativa, id_area_curricular, codigo, codigo_normalizado,
          nombre, nombre_corto, descripcion, orden, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVA',now(),now())
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.idAreaCurricular,
        entrada.codigo,
        entrada.codigoNormalizado,
        entrada.nombre,
        entrada.nombreCorto ?? null,
        entrada.descripcion ?? null,
        entrada.orden,
      ],
    );
    return { id: rows[0].id };
  }

  async obtenerAsignaturaBase(
    id: string,
    institucionId: string,
  ): Promise<{
    id: string;
    estado: EstadoAsignatura;
    idAreaCurricular: string;
  } | null> {
    const rows = await this.ds.query<FilaAsignaturaBase[]>(
      `SELECT id, estado, id_area_curricular FROM asignaturas
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      estado: row.estado as EstadoAsignatura,
      idAreaCurricular: row.id_area_curricular,
    };
  }

  async actualizarAsignatura(entrada: {
    id: string;
    institucionId: string;
    idAreaCurricular?: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    nombreCorto?: string | null;
    descripcion?: string | null;
    orden?: number;
  }): Promise<boolean> {
    const sets: string[] = ['fecha_modificacion = now()'];
    const params: unknown[] = [entrada.id, entrada.institucionId];
    let i = 3;
    if (entrada.idAreaCurricular !== undefined) {
      sets.push(`id_area_curricular = $${i++}`);
      params.push(entrada.idAreaCurricular);
    }
    if (entrada.codigo !== undefined) {
      sets.push(`codigo = $${i++}`);
      params.push(entrada.codigo);
    }
    if (entrada.codigoNormalizado !== undefined) {
      sets.push(`codigo_normalizado = $${i++}`);
      params.push(entrada.codigoNormalizado);
    }
    if (entrada.nombre !== undefined) {
      sets.push(`nombre = $${i++}`);
      params.push(entrada.nombre);
    }
    if (entrada.nombreCorto !== undefined) {
      sets.push(`nombre_corto = $${i++}`);
      params.push(entrada.nombreCorto);
    }
    if (entrada.descripcion !== undefined) {
      sets.push(`descripcion = $${i++}`);
      params.push(entrada.descripcion);
    }
    if (entrada.orden !== undefined) {
      sets.push(`orden = $${i++}`);
      params.push(entrada.orden);
    }
    const result = await this.ds.query<{ id: string }[]>(
      `UPDATE asignaturas SET ${sets.join(', ')}
       WHERE id = $1 AND id_institucion_educativa = $2 RETURNING id`,
      params,
    );
    return result.length > 0;
  }

  async cambiarEstadoAsignatura(
    id: string,
    institucionId: string,
    estado: EstadoAsignatura,
  ): Promise<boolean> {
    const result = await this.ds.query<{ id: string }[]>(
      `UPDATE asignaturas SET estado = $3, fecha_modificacion = now()
       WHERE id = $1 AND id_institucion_educativa = $2 RETURNING id`,
      [id, institucionId, estado],
    );
    return result.length > 0;
  }

  async estaAsignaturaEnPlanActivo(
    idAsignatura: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total
       FROM detalles_plan_estudio d
       JOIN planes_estudio p ON p.id = d.id_plan_estudio
         AND p.id_institucion_educativa = d.id_institucion_educativa
       WHERE d.id_asignatura = $1 AND d.id_institucion_educativa = $2
         AND d.estado = 'ACTIVO'
         AND p.estado IN ('BORRADOR','APROBADO','VIGENTE')`,
      [idAsignatura, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async esAreaDeOtraInstitucion(
    idArea: string,
    idAsignatura: string,
    institucionId: string,
  ): Promise<boolean> {
    // Returns true if the area exists but belongs to a different institution than idAsignatura's institution
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM areas_curriculares
       WHERE id = $1 AND id_institucion_educativa <> $2`,
      [idArea, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }
}
