import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EstadoArea,
  RepositorioAreasCurriculares,
} from '../../../../dominio/puertos/curriculo.puerto';

interface FilaConteo {
  total: string;
}

interface FilaEstadoArea {
  id: string;
  estado: string;
}

@Injectable()
export class RepositorioAreasCurricularesTypeorm implements RepositorioAreasCurriculares {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async existeCodigoAreaEnInstitucion(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM areas_curriculares
       WHERE id_institucion_educativa = $1 AND codigo_normalizado = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [institucionId, codigoNormalizado, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeNombreAreaEnInstitucion(
    nombreNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM areas_curriculares
       WHERE id_institucion_educativa = $1 AND nombre_normalizado = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [institucionId, nombreNormalizado, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeOrdenAreaEnInstitucion(
    orden: number,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM areas_curriculares
       WHERE id_institucion_educativa = $1 AND orden = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [institucionId, orden, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async crearArea(entrada: {
    institucionId: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    nombreNormalizado: string;
    descripcion?: string | null;
    orden: number;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<{ id: string }[]>(
      `INSERT INTO areas_curriculares
         (id_institucion_educativa, codigo, codigo_normalizado, nombre, nombre_normalizado,
          descripcion, orden, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'ACTIVA',now(),now())
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.codigo,
        entrada.codigoNormalizado,
        entrada.nombre,
        entrada.nombreNormalizado,
        entrada.descripcion ?? null,
        entrada.orden,
      ],
    );
    return { id: rows[0].id };
  }

  async obtenerAreaBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoArea } | null> {
    const rows = await this.ds.query<FilaEstadoArea[]>(
      `SELECT id, estado FROM areas_curriculares
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId],
    );
    const row = rows[0];
    if (!row) return null;
    return { id: row.id, estado: row.estado as EstadoArea };
  }

  async actualizarArea(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    nombreNormalizado?: string;
    descripcion?: string | null;
    orden?: number;
  }): Promise<boolean> {
    const sets: string[] = ['fecha_modificacion = now()'];
    const params: unknown[] = [entrada.id, entrada.institucionId];
    let i = 3;
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
    if (entrada.nombreNormalizado !== undefined) {
      sets.push(`nombre_normalizado = $${i++}`);
      params.push(entrada.nombreNormalizado);
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
      `UPDATE areas_curriculares SET ${sets.join(', ')}
       WHERE id = $1 AND id_institucion_educativa = $2 RETURNING id`,
      params,
    );
    return result.length > 0;
  }

  async cambiarEstadoArea(
    id: string,
    institucionId: string,
    estado: EstadoArea,
  ): Promise<boolean> {
    const result = await this.ds.query<{ id: string }[]>(
      `UPDATE areas_curriculares SET estado = $3, fecha_modificacion = now()
       WHERE id = $1 AND id_institucion_educativa = $2 RETURNING id`,
      [id, institucionId, estado],
    );
    return result.length > 0;
  }

  async tieneAsignaturasActivas(
    idArea: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM asignaturas
       WHERE id_area_curricular = $1 AND id_institucion_educativa = $2
         AND estado = 'ACTIVA'`,
      [idArea, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }
}
