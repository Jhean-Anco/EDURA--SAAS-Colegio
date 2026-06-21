import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EstadoNivel,
  RepositorioCatalogosAcademicos,
} from '../../../../dominio/puertos/estructura-academica.puerto';

interface FilaId {
  id: string;
}

interface FilaConteo {
  total: string;
}

interface FilaEstadoNivel {
  id: string;
  estado: string;
}

interface FilaEstadoGrado {
  id: string;
  estado: string;
  id_nivel_educativo: string;
}

@Injectable()
export class RepositorioCatalogosAcademicosTypeorm implements RepositorioCatalogosAcademicos {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async existeCodigoNivelEnInstitucion(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM niveles_educativos
       WHERE id_institucion_educativa = $1 AND codigo_normalizado = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [institucionId, codigoNormalizado, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeOrdenNivelEnInstitucion(
    orden: number,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM niveles_educativos
       WHERE id_institucion_educativa = $1 AND orden = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [institucionId, orden, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async crearNivelEducativo(entrada: {
    institucionId: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    descripcion?: string | null;
    orden: number;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<FilaId[]>(
      `INSERT INTO niveles_educativos
         (id_institucion_educativa, codigo, codigo_normalizado, nombre, descripcion, orden)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.codigo,
        entrada.codigoNormalizado,
        entrada.nombre,
        entrada.descripcion ?? null,
        entrada.orden,
      ],
    );
    return { id: rows[0].id };
  }

  async obtenerNivelBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoNivel } | null> {
    const rows = await this.ds.query<FilaEstadoNivel[]>(
      `SELECT id, estado FROM niveles_educativos
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId],
    );
    if (!rows.length) return null;
    const r = rows[0];
    return { id: r.id, estado: r.estado as EstadoNivel };
  }

  async actualizarNivelEducativo(entrada: {
    id: string;
    institucionId: string;
    nombre?: string;
    descripcion?: string | null;
    orden?: number;
    estado?: EstadoNivel;
  }): Promise<boolean> {
    const sets: string[] = ['fecha_modificacion = now()'];
    const params: unknown[] = [entrada.id, entrada.institucionId];
    let idx = 3;
    if (entrada.nombre !== undefined) {
      sets.push(`nombre = $${idx++}`);
      params.push(entrada.nombre);
    }
    if (entrada.descripcion !== undefined) {
      sets.push(`descripcion = $${idx++}`);
      params.push(entrada.descripcion);
    }
    if (entrada.orden !== undefined) {
      sets.push(`orden = $${idx++}`);
      params.push(entrada.orden);
    }
    if (entrada.estado !== undefined) {
      sets.push(`estado = $${idx++}`);
      params.push(entrada.estado);
    }
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE niveles_educativos SET ${sets.join(', ')}
       WHERE id = $1 AND id_institucion_educativa = $2`,
      params,
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async existeCodigoGradoEnNivel(
    codigoNormalizado: string,
    idNivel: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM grados_educativos
       WHERE id_nivel_educativo = $1 AND id_institucion_educativa = $2
         AND codigo_normalizado = $3 AND ($4::uuid IS NULL OR id <> $4)`,
      [idNivel, institucionId, codigoNormalizado, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async existeOrdenGradoEnNivel(
    orden: number,
    idNivel: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM grados_educativos
       WHERE id_nivel_educativo = $1 AND id_institucion_educativa = $2
         AND orden = $3 AND ($4::uuid IS NULL OR id <> $4)`,
      [idNivel, institucionId, orden, excluirId ?? null],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async crearGradoEducativo(entrada: {
    institucionId: string;
    idNivelEducativo: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    descripcion?: string | null;
    orden: number;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<FilaId[]>(
      `INSERT INTO grados_educativos
         (id_institucion_educativa, id_nivel_educativo, codigo, codigo_normalizado,
          nombre, descripcion, orden)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.idNivelEducativo,
        entrada.codigo,
        entrada.codigoNormalizado,
        entrada.nombre,
        entrada.descripcion ?? null,
        entrada.orden,
      ],
    );
    return { id: rows[0].id };
  }

  async obtenerGradoBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoNivel; idNivel: string } | null> {
    const rows = await this.ds.query<FilaEstadoGrado[]>(
      `SELECT id, estado, id_nivel_educativo FROM grados_educativos
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId],
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      estado: r.estado as EstadoNivel,
      idNivel: r.id_nivel_educativo,
    };
  }

  async actualizarGradoEducativo(entrada: {
    id: string;
    institucionId: string;
    nombre?: string;
    descripcion?: string | null;
    orden?: number;
    estado?: EstadoNivel;
  }): Promise<boolean> {
    const sets: string[] = ['fecha_modificacion = now()'];
    const params: unknown[] = [entrada.id, entrada.institucionId];
    let idx = 3;
    if (entrada.nombre !== undefined) {
      sets.push(`nombre = $${idx++}`);
      params.push(entrada.nombre);
    }
    if (entrada.descripcion !== undefined) {
      sets.push(`descripcion = $${idx++}`);
      params.push(entrada.descripcion);
    }
    if (entrada.orden !== undefined) {
      sets.push(`orden = $${idx++}`);
      params.push(entrada.orden);
    }
    if (entrada.estado !== undefined) {
      sets.push(`estado = $${idx++}`);
      params.push(entrada.estado);
    }
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE grados_educativos SET ${sets.join(', ')}
       WHERE id = $1 AND id_institucion_educativa = $2`,
      params,
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async cambiarEstadoNivel(
    id: string,
    institucionId: string,
    estado: EstadoNivel,
  ): Promise<boolean> {
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE niveles_educativos SET estado = $3, fecha_modificacion = now()
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId, estado],
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async tieneGradosActivos(
    idNivel: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM grados_educativos
       WHERE id_nivel_educativo = $1 AND id_institucion_educativa = $2
         AND estado = 'ACTIVO'`,
      [idNivel, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async cambiarEstadoGrado(
    id: string,
    institucionId: string,
    estado: EstadoNivel,
  ): Promise<boolean> {
    const result = await this.ds.query<
      [unknown, number] | { affected?: number }
    >(
      `UPDATE grados_educativos SET estado = $3, fecha_modificacion = now()
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId, estado],
    );
    const affected = Array.isArray(result)
      ? result[1]
      : (result?.affected ?? 0);
    return affected > 0;
  }

  async tieneOfertasActivasOPlanificadas(
    idGrado: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM ofertas_grado_sede
       WHERE id_grado_educativo = $1 AND id_institucion_educativa = $2
         AND estado IN ('ACTIVA', 'PLANIFICADA')`,
      [idGrado, institucionId],
    );
    return Number.parseInt(rows[0]?.total ?? '0', 10) > 0;
  }
}
