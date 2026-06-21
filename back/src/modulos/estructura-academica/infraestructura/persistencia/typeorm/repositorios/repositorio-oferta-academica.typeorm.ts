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
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
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
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async crearSeccionAcademica(entrada: {
    institucionId: string;
    idOfertaGradoSede: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    turno: string;
    capacidadMaxima?: number | null;
    idDocenteTutor?: string | null;
    idEspacioFisico?: string | null;
  }): Promise<{ id: string }> {
    const rows = await this.ds.query<FilaId[]>(
      `INSERT INTO secciones_academicas
         (id_institucion_educativa, id_oferta_grado_sede, codigo, codigo_normalizado, nombre, turno,
          capacidad_maxima, id_docente_tutor, id_espacio_fisico)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.idOfertaGradoSede,
        entrada.codigo,
        entrada.codigoNormalizado,
        entrada.nombre,
        entrada.turno,
        entrada.capacidadMaxima ?? null,
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
  } | null> {
    const rows = await this.ds.query<FilaEstadoSeccion[]>(
      `SELECT sa.id, sa.estado, sa.id_oferta_grado_sede, ogs.id_sede FROM secciones_academicas sa
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
    };
  }

  async actualizarSeccion(entrada: {
    id: string;
    institucionId: string;
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

  async verificarEspacioFisicoEnSede(
    idEspacioFisico: string,
    idSede: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM elementos_infraestructura
       WHERE id = $1 AND id_sede = $2`,
      [idEspacioFisico, idSede],
    );
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
  }

  async verificarDocenteTutorEnSede(
    idDocente: string,
    idSede: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query<FilaConteo[]>(
      `SELECT COUNT(*)::text AS total FROM asignaciones_docente_sede
       WHERE id_docente = $1 AND id_sede = $2 AND id_institucion_educativa = $3 AND estado = 'ACTIVA'`,
      [idDocente, idSede, institucionId],
    );
    return parseInt(rows[0]?.total ?? '0', 10) > 0;
  }
}
