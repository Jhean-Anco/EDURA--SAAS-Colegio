/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  Matricula,
  HistorialEstado,
  HistorialSeccion,
  AlcanceAcceso,
} from '../../../../dominio/matriculas/matricula';
import {
  MatriculasPuerto,
  FiltrosListarMatriculas,
  DetalleSeccionBloqueada,
} from '../../../../dominio/puertos/matriculas.puerto';
import { OperacionSobreSedeNoPermitidaError } from '../../../../dominio/errores-matriculas';

@Injectable()
export class MatriculasTypeormRepositorio implements MatriculasPuerto {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  private mapearAFila(m: Matricula): any {
    return {
      id: m.id,
      id_institucion_educativa: m.idInstitucionEducativa,
      id_sede: m.idSede,
      id_estudiante: m.idEstudiante,
      id_anio_academico: m.idAnioAcademico,
      id_nivel_educativo: m.idNivelEducativo,
      id_grado_educativo: m.idGradoEducativo,
      id_oferta_grado_sede: m.idOfertaGradoSede,
      id_seccion_academica: m.idSeccionAcademica,
      codigo_matricula: m.codigoMatricula,
      fecha_matricula: m.fechaMatricula.toISOString().split('T')[0],
      estado: m.estado,
      observacion: m.observacion,
      id_usuario_creador: m.idUsuarioCreador,
      id_usuario_activador: m.idUsuarioActivador,
      fecha_activacion: m.fechaActivacion,
      id_usuario_retiro: m.idUsuarioRetiro,
      fecha_retiro: m.fechaRetiro,
      motivo_retiro: m.motivoRetiro,
      id_usuario_anulacion: m.idUsuarioAnulacion,
      fecha_anulacion: m.fechaAnulacion,
      motivo_anulacion: m.motivoAnulacion,
    };
  }

  private mapearADominio(f: any): Matricula {
    return new Matricula(
      f.id,
      f.id_institucion_educativa,
      f.id_sede,
      f.id_estudiante,
      f.id_anio_academico,
      f.id_nivel_educativo,
      f.id_grado_educativo,
      f.id_oferta_grado_sede,
      f.id_seccion_academica,
      f.codigo_matricula,
      new Date(f.fecha_matricula),
      f.estado,
      f.observacion,
      f.id_usuario_creador,
      f.id_usuario_activador,
      f.fecha_activacion ? new Date(f.fecha_activacion) : null,
      f.id_usuario_retiro,
      f.fecha_retiro ? new Date(f.fecha_retiro) : null,
      f.motivo_retiro,
      f.id_usuario_anulacion,
      f.fecha_anulacion ? new Date(f.fecha_anulacion) : null,
      f.motivo_anulacion,
      new Date(f.fecha_creacion),
      new Date(f.fecha_modificacion),
    );
  }

  async guardar(matricula: Matricula, manager?: any): Promise<void> {
    const conn = manager ?? this.ds;
    const f = this.mapearAFila(matricula);

    const existe = await conn.query(
      'SELECT 1 FROM matriculas WHERE id = $1 LIMIT 1',
      [f.id],
    );

    if (existe.length > 0) {
      await conn.query(
        `UPDATE matriculas SET
          id_sede = $2,
          id_estudiante = $3,
          id_anio_academico = $4,
          id_nivel_educativo = $5,
          id_grado_educativo = $6,
          id_oferta_grado_sede = $7,
          id_seccion_academica = $8,
          codigo_matricula = $9,
          fecha_matricula = $10,
          estado = $11,
          observacion = $12,
          id_usuario_activador = $13,
          fecha_activacion = $14,
          id_usuario_retiro = $15,
          fecha_retiro = $16,
          motivo_retiro = $17,
          id_usuario_anulacion = $18,
          fecha_anulacion = $19,
          motivo_anulacion = $20,
          fecha_modificacion = now()
        WHERE id = $1`,
        [
          f.id,
          f.id_sede,
          f.id_estudiante,
          f.id_anio_academico,
          f.id_nivel_educativo,
          f.id_grado_educativo,
          f.id_oferta_grado_sede,
          f.id_seccion_academica,
          f.codigo_matricula,
          f.fecha_matricula,
          f.estado,
          f.observacion,
          f.id_usuario_activador,
          f.fecha_activacion,
          f.id_usuario_retiro,
          f.fecha_retiro,
          f.motivo_retiro,
          f.id_usuario_anulacion,
          f.fecha_anulacion,
          f.motivo_anulacion,
        ],
      );
    } else {
      await conn.query(
        `INSERT INTO matriculas (
          id, id_institucion_educativa, id_sede, id_estudiante, id_anio_academico,
          id_nivel_educativo, id_grado_educativo, id_oferta_grado_sede, id_seccion_academica,
          codigo_matricula, fecha_matricula, estado, observacion, id_usuario_creador,
          fecha_creacion, fecha_modificacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now(), now()
        )`,
        [
          f.id,
          f.id_institucion_educativa,
          f.id_sede,
          f.id_estudiante,
          f.id_anio_academico,
          f.id_nivel_educativo,
          f.id_grado_educativo,
          f.id_oferta_grado_sede,
          f.id_seccion_academica,
          f.codigo_matricula,
          f.fecha_matricula,
          f.estado,
          f.observacion,
          f.id_usuario_creador,
        ],
      );
    }
  }

  async buscarPorId(
    id: string,
    alcance: AlcanceAcceso,
    manager?: any,
  ): Promise<Matricula | null> {
    const conn = manager ?? this.ds;
    let query =
      'SELECT * FROM matriculas WHERE id = $1 AND id_institucion_educativa = $2';
    const params: any[] = [id, alcance.institucionId];

    if (alcance.ambito === 'SEDE') {
      query += ' AND id_sede = $3';
      params.push(alcance.sedeId);
    }

    const rows = await conn.query(query, params);
    if (rows.length === 0) return null;
    return this.mapearADominio(rows[0]);
  }

  async listar(
    filtros: FiltrosListarMatriculas,
    alcance: AlcanceAcceso,
  ): Promise<{ total: number; datos: Matricula[] }> {
    let query = `
      SELECT m.*, 
             p.nombres as "estudianteNombres",
             p.apellido_paterno as "estudianteApellidoPaterno",
             p.apellido_materno as "estudianteApellidoMaterno"
      FROM matriculas m
      JOIN estudiantes e ON m.id_estudiante = e.id
      JOIN personas p ON e.id_persona = p.id
      WHERE m.id_institucion_educativa = $1
    `;
    const params: any[] = [alcance.institucionId];
    let countParamIndex = 2;

    if (alcance.ambito === 'SEDE') {
      if (filtros.idSede && filtros.idSede !== alcance.sedeId) {
        throw new OperacionSobreSedeNoPermitidaError();
      }
      query += ` AND m.id_sede = $${countParamIndex++}`;
      params.push(alcance.sedeId);
    } else if (filtros.idSede) {
      query += ` AND m.id_sede = $${countParamIndex++}`;
      params.push(filtros.idSede);
    }

    if (filtros.idAnioAcademico) {
      query += ` AND m.id_anio_academico = $${countParamIndex++}`;
      params.push(filtros.idAnioAcademico);
    }
    if (filtros.idNivelEducativo) {
      query += ` AND m.id_nivel_educativo = $${countParamIndex++}`;
      params.push(filtros.idNivelEducativo);
    }
    if (filtros.idGradoEducativo) {
      query += ` AND m.id_grado_educativo = $${countParamIndex++}`;
      params.push(filtros.idGradoEducativo);
    }
    if (filtros.idSeccion) {
      query += ` AND m.id_seccion_academica = $${countParamIndex++}`;
      params.push(filtros.idSeccion);
    }
    if (filtros.idEstudiante) {
      query += ` AND m.id_estudiante = $${countParamIndex++}`;
      params.push(filtros.idEstudiante);
    }
    if (filtros.estado) {
      query += ` AND m.estado = $${countParamIndex++}`;
      params.push(filtros.estado);
    }
    if (filtros.busqueda) {
      query += ` AND (m.codigo_matricula ILIKE $${countParamIndex} OR p.nombres ILIKE $${countParamIndex} OR p.apellido_paterno ILIKE $${countParamIndex} OR p.apellido_materno ILIKE $${countParamIndex})`;
      params.push(`%${filtros.busqueda}%`);
      countParamIndex++;
    }

    // Execute count query
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
    const countResult = await this.ds.query(countQuery, params);
    const total = parseInt(countResult[0].total, 10);

    // Apply pagination
    const pagina = filtros.pagina ?? 1;
    const tamano = filtros.tamano ?? 20;
    const offset = (pagina - 1) * tamano;

    query += ` ORDER BY m.fecha_creacion DESC LIMIT $${countParamIndex++} OFFSET $${countParamIndex++}`;
    params.push(tamano, offset);

    const rows = await this.ds.query(query, params);
    const datos = rows.map((r: any) => this.mapearADominio(r));

    return { total, datos };
  }

  async estudianteTieneMatriculaActiva(
    idInstitucion: string,
    idEstudiante: string,
    idAnio: string,
    exceptoMatriculaId?: string,
    manager?: any,
  ): Promise<boolean> {
    const conn = manager ?? this.ds;
    const rows = await conn.query(
      `SELECT 1 FROM matriculas
       WHERE id_institucion_educativa = $1
         AND id_estudiante = $2
         AND id_anio_academico = $3
         AND estado = 'ACTIVA'
         AND ($4::uuid IS NULL OR id <> $4)
       LIMIT 1`,
      [idInstitucion, idEstudiante, idAnio, exceptoMatriculaId ?? null],
    );
    return rows.length > 0;
  }

  async obtenerSeccionConBloqueo(
    idSeccion: string,
    manager: any,
  ): Promise<DetalleSeccionBloqueada | null> {
    const rows = await manager.query(
      `SELECT s.id, 
              s.capacidad_maxima as "capacidadMaxima", 
              s.estado, 
              o.id_sede as "idSede", 
              o.id_anio_academico as "idAnioAcademico", 
              o.id_grado_educativo as "idGradoEducativo", 
              o.id as "idOfertaGradoSede"
       FROM secciones_academicas s
       JOIN ofertas_grado_sede o ON s.id_oferta_grado_sede = o.id
       WHERE s.id = $1
       FOR UPDATE`,
      [idSeccion],
    );
    if (rows.length === 0) return null;
    return rows[0] as DetalleSeccionBloqueada;
  }

  async contarMatriculasActivasEnSeccion(
    idSeccion: string,
    manager?: any,
  ): Promise<number> {
    const conn = manager ?? this.ds;
    const rows = await conn.query(
      `SELECT COUNT(*) as total FROM matriculas WHERE id_seccion_academica = $1 AND estado = 'ACTIVA'`,
      [idSeccion],
    );
    return parseInt(rows[0].total, 10);
  }

  async registrarHistorialEstado(
    historial: HistorialEstado,
    manager?: any,
  ): Promise<void> {
    const conn = manager ?? this.ds;
    const matriculaId = historial.idMatricula;
    const res = (await conn.query(
      'SELECT id_institucion_educativa FROM matriculas WHERE id = $1',
      [matriculaId],
    )) as { id_institucion_educativa: string }[];
    const instId = res[0]?.id_institucion_educativa;

    await conn.query(
      `INSERT INTO historial_estados_matricula (
        id, id_institucion_educativa, id_matricula, estado_anterior, estado_nuevo, motivo, id_usuario, correlacion_id, fecha
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
      )`,
      [
        instId,
        matriculaId,
        historial.estadoAnterior,
        historial.estadoNuevo,
        historial.motivo,
        historial.idUsuario,
        historial.correlacionId ?? null,
        historial.fecha,
      ],
    );
  }

  async registrarHistorialSeccion(
    historial: HistorialSeccion,
    manager?: any,
  ): Promise<void> {
    const conn = manager ?? this.ds;
    const matriculaId = historial.idMatricula;
    const res = (await conn.query(
      'SELECT id_institucion_educativa FROM matriculas WHERE id = $1',
      [matriculaId],
    )) as { id_institucion_educativa: string }[];
    const instId = res[0]?.id_institucion_educativa;

    await conn.query(
      `INSERT INTO historial_cambios_seccion_matricula (
        id, id_institucion_educativa, id_matricula, id_seccion_anterior, id_seccion_nueva, motivo, id_usuario, correlacion_id, fecha
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
      )`,
      [
        instId,
        matriculaId,
        historial.idSeccionAnterior,
        historial.idSeccionNueva,
        historial.motivo,
        historial.idUsuario,
        historial.correlacionId ?? null,
        historial.fecha,
      ],
    );
  }

  async obtenerHistorialEstados(
    idMatricula: string,
    alcance: AlcanceAcceso,
  ): Promise<HistorialEstado[]> {
    const rows = await this.ds.query(
      `SELECT h.id, h.estado_anterior as "estadoAnterior", h.estado_nuevo as "estadoNuevo", 
              h.motivo, h.id_usuario as "idUsuario", h.fecha, h.correlacion_id as "correlacionId"
       FROM historial_estados_matricula h
       JOIN matriculas m ON h.id_matricula = m.id
       WHERE h.id_matricula = $1 AND m.id_institucion_educativa = $2
       ORDER BY h.fecha ASC`,
      [idMatricula, alcance.institucionId],
    );
    return rows;
  }

  async obtenerHistorialSecciones(
    idMatricula: string,
    alcance: AlcanceAcceso,
  ): Promise<HistorialSeccion[]> {
    const rows = await this.ds.query(
      `SELECT h.id, h.id_seccion_anterior as "idSeccionAnterior", h.id_seccion_nueva as "idSeccionNueva", 
              h.motivo, h.id_usuario as "idUsuario", h.fecha, h.correlacion_id as "correlacionId"
       FROM historial_cambios_seccion_matricula h
       JOIN matriculas m ON h.id_matricula = m.id
       WHERE h.id_matricula = $1 AND m.id_institucion_educativa = $2
       ORDER BY h.fecha ASC`,
      [idMatricula, alcance.institucionId],
    );
    return rows;
  }

  async ejecutarTransaccion<T>(
    operacion: (manager: any) => Promise<T>,
  ): Promise<T> {
    return this.ds.transaction(operacion);
  }

  // Helpers de verificacion
  async verificarEstudiante(
    idEstudiante: string,
    idInstitucion: string,
  ): Promise<{ id: string; estado: string; idSede: string } | null> {
    const rows = await this.ds.query(
      'SELECT id, estado, id_sede as "idSede" FROM estudiantes WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1',
      [idEstudiante, idInstitucion],
    );
    return rows[0] ?? null;
  }

  async verificarAnioAcademico(
    idAnio: string,
    idInstitucion: string,
  ): Promise<{ id: string; estado: string } | null> {
    const rows = await this.ds.query(
      'SELECT id, estado FROM anios_academicos WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1',
      [idAnio, idInstitucion],
    );
    return rows[0] ?? null;
  }

  async verificarOfertaGradoSede(
    idOferta: string,
    idInstitucion: string,
  ): Promise<{
    id: string;
    idSede: string;
    idAnioAcademico: string;
    idGradoEducativo: string;
    estado: string;
  } | null> {
    const rows = await this.ds.query(
      `SELECT id, id_sede as "idSede", id_anio_academico as "idAnioAcademico", id_grado_educativo as "idGradoEducativo", estado 
       FROM ofertas_grado_sede WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
      [idOferta, idInstitucion],
    );
    return rows[0] ?? null;
  }

  async verificarGrado(
    idGrado: string,
    idInstitucion: string,
  ): Promise<{ id: string; idNivelEducativo: string; estado: string } | null> {
    const rows = await this.ds.query(
      'SELECT id, id_nivel_educativo as "idNivelEducativo", estado FROM grados_educativos WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1',
      [idGrado, idInstitucion],
    );
    return rows[0] ?? null;
  }

  async verificarSede(
    idSede: string,
    idInstitucion: string,
  ): Promise<{ id: string; estado: string } | null> {
    const rows = await this.ds.query(
      'SELECT id, estado FROM sedes WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1',
      [idSede, idInstitucion],
    );
    return rows[0] ?? null;
  }

  async verificarSeccion(
    idSeccion: string,
    idInstitucion: string,
  ): Promise<{ id: string; idOfertaGradoSede: string; estado: string } | null> {
    const rows = await this.ds.query(
      'SELECT id, id_oferta_grado_sede as "idOfertaGradoSede", estado FROM secciones_academicas WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1',
      [idSeccion, idInstitucion],
    );
    return rows[0] ?? null;
  }

  async existeCodigoMatricula(
    codigo: string,
    idInstitucion: string,
    exceptoMatriculaId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query(
      `SELECT 1 FROM matriculas 
       WHERE id_institucion_educativa = $1 AND codigo_matricula = $2 
         AND ($3::uuid IS NULL OR id <> $3) 
       LIMIT 1`,
      [idInstitucion, codigo, exceptoMatriculaId ?? null],
    );
    return rows.length > 0;
  }
}
