import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AreaCurricularResumen,
  AsignaturaResumen,
  ConsultadorCurriculo,
  DetallePlanResumen,
  EstadoArea,
  EstadoAsignatura,
  EstadoPlan,
  PlanEstudioListaItem,
  PlanEstudioResumen,
} from '../../../../dominio/puertos/curriculo.puerto';

@Injectable()
export class ConsultadorCurriculoTypeorm implements ConsultadorCurriculo {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async listarAreas(
    institucionId: string,
    estado?: EstadoArea | null,
  ): Promise<AreaCurricularResumen[]> {
    const params: unknown[] = [institucionId];
    let filtroEstado = '';
    if (estado) {
      filtroEstado = `AND estado = $${params.push(estado)}`;
    }
    const rows = await this.ds.query<
      {
        id: string;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        estado: string;
      }[]
    >(
      `SELECT id, codigo, nombre, descripcion, orden, estado
       FROM areas_curriculares
       WHERE id_institucion_educativa = $1 ${filtroEstado}
       ORDER BY orden`,
      params,
    );
    return rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      descripcion: r.descripcion,
      orden: r.orden,
      estado: r.estado as EstadoArea,
    }));
  }

  async obtenerArea(
    id: string,
    institucionId: string,
  ): Promise<AreaCurricularResumen | null> {
    const rows = await this.ds.query<
      {
        id: string;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        estado: string;
      }[]
    >(
      `SELECT id, codigo, nombre, descripcion, orden, estado
       FROM areas_curriculares
       WHERE id = $1 AND id_institucion_educativa = $2`,
      [id, institucionId],
    );
    const r = rows[0];
    if (!r) return null;
    return {
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      descripcion: r.descripcion,
      orden: r.orden,
      estado: r.estado as EstadoArea,
    };
  }

  async listarAsignaturas(
    institucionId: string,
    idArea?: string | null,
    estado?: EstadoAsignatura | null,
  ): Promise<AsignaturaResumen[]> {
    const params: unknown[] = [institucionId];
    const filtros: string[] = [];
    if (idArea) {
      filtros.push(`a.id_area_curricular = $${params.push(idArea)}`);
    }
    if (estado) {
      filtros.push(`a.estado = $${params.push(estado)}`);
    }
    const where = filtros.length ? `AND ${filtros.join(' AND ')}` : '';
    const rows = await this.ds.query<
      {
        id: string;
        id_area_curricular: string;
        nombre_area: string;
        codigo: string;
        nombre: string;
        nombre_corto: string | null;
        descripcion: string | null;
        orden: number;
        estado: string;
      }[]
    >(
      `SELECT a.id, a.id_area_curricular, ac.nombre AS nombre_area,
              a.codigo, a.nombre, a.nombre_corto, a.descripcion, a.orden, a.estado
       FROM asignaturas a
       JOIN areas_curriculares ac ON ac.id = a.id_area_curricular
         AND ac.id_institucion_educativa = a.id_institucion_educativa
       WHERE a.id_institucion_educativa = $1 ${where}
       ORDER BY a.orden`,
      params,
    );
    return rows.map((r) => ({
      id: r.id,
      idAreaCurricular: r.id_area_curricular,
      nombreArea: r.nombre_area,
      codigo: r.codigo,
      nombre: r.nombre,
      nombreCorto: r.nombre_corto,
      descripcion: r.descripcion,
      orden: r.orden,
      estado: r.estado as EstadoAsignatura,
    }));
  }

  async obtenerAsignatura(
    id: string,
    institucionId: string,
  ): Promise<AsignaturaResumen | null> {
    const rows = await this.ds.query<
      {
        id: string;
        id_area_curricular: string;
        nombre_area: string;
        codigo: string;
        nombre: string;
        nombre_corto: string | null;
        descripcion: string | null;
        orden: number;
        estado: string;
      }[]
    >(
      `SELECT a.id, a.id_area_curricular, ac.nombre AS nombre_area,
              a.codigo, a.nombre, a.nombre_corto, a.descripcion, a.orden, a.estado
       FROM asignaturas a
       JOIN areas_curriculares ac ON ac.id = a.id_area_curricular
         AND ac.id_institucion_educativa = a.id_institucion_educativa
       WHERE a.id = $1 AND a.id_institucion_educativa = $2`,
      [id, institucionId],
    );
    const r = rows[0];
    if (!r) return null;
    return {
      id: r.id,
      idAreaCurricular: r.id_area_curricular,
      nombreArea: r.nombre_area,
      codigo: r.codigo,
      nombre: r.nombre,
      nombreCorto: r.nombre_corto,
      descripcion: r.descripcion,
      orden: r.orden,
      estado: r.estado as EstadoAsignatura,
    };
  }

  async listarPlanes(
    institucionId: string,
    idAnio?: string | null,
    idGrado?: string | null,
    estado?: EstadoPlan | null,
  ): Promise<PlanEstudioListaItem[]> {
    const params: unknown[] = [institucionId];
    const filtros: string[] = [];
    if (idAnio) {
      filtros.push(`p.id_anio_academico = $${params.push(idAnio)}`);
    }
    if (idGrado) {
      filtros.push(`p.id_grado_educativo = $${params.push(idGrado)}`);
    }
    if (estado) {
      filtros.push(`p.estado = $${params.push(estado)}`);
    }
    const where = filtros.length ? `AND ${filtros.join(' AND ')}` : '';
    const rows = await this.ds.query<
      {
        id: string;
        codigo: string;
        nombre: string;
        version: number;
        estado: string;
        id_anio_academico: string;
        anio: number;
        id_grado_educativo: string;
        nombre_grado: string;
        nombre_nivel: string;
      }[]
    >(
      `SELECT p.id, p.codigo, p.nombre, p.version, p.estado,
              p.id_anio_academico, aa.anio,
              p.id_grado_educativo, g.nombre AS nombre_grado, n.nombre AS nombre_nivel
       FROM planes_estudio p
       JOIN anios_academicos aa ON aa.id = p.id_anio_academico
         AND aa.id_institucion_educativa = p.id_institucion_educativa
       JOIN grados_educativos g ON g.id = p.id_grado_educativo
         AND g.id_institucion_educativa = p.id_institucion_educativa
       JOIN niveles_educativos n ON n.id = g.id_nivel_educativo
         AND n.id_institucion_educativa = p.id_institucion_educativa
       WHERE p.id_institucion_educativa = $1 ${where}
       ORDER BY aa.anio DESC, g.orden, p.version`,
      params,
    );
    return rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      version: r.version,
      estado: r.estado as EstadoPlan,
      idAnioAcademico: r.id_anio_academico,
      anio: r.anio,
      idGradoEducativo: r.id_grado_educativo,
      nombreGrado: r.nombre_grado,
      nombreNivel: r.nombre_nivel,
    }));
  }

  async obtenerPlan(
    id: string,
    institucionId: string,
  ): Promise<PlanEstudioResumen | null> {
    return this._obtenerPlanCompleto(
      `WHERE p.id = $1 AND p.id_institucion_educativa = $2`,
      [id, institucionId],
    );
  }

  async resolverPlanVigente(
    idAnio: string,
    idGrado: string,
    institucionId: string,
  ): Promise<PlanEstudioResumen | null> {
    return this._obtenerPlanCompleto(
      `WHERE p.id_anio_academico = $1 AND p.id_grado_educativo = $2
         AND p.id_institucion_educativa = $3 AND p.estado = 'VIGENTE'`,
      [idAnio, idGrado, institucionId],
    );
  }

  private async _obtenerPlanCompleto(
    whereClause: string,
    params: unknown[],
  ): Promise<PlanEstudioResumen | null> {
    const planRows = await this.ds.query<
      {
        id: string;
        codigo: string;
        nombre: string;
        version: number;
        estado: string;
        id_anio_academico: string;
        anio: number;
        id_grado_educativo: string;
        nombre_grado: string;
        nombre_nivel: string;
        observacion: string | null;
        fecha_aprobacion: string | null;
        id_usuario_aprobador: string | null;
      }[]
    >(
      `SELECT p.id, p.codigo, p.nombre, p.version, p.estado,
              p.id_anio_academico, aa.anio,
              p.id_grado_educativo, g.nombre AS nombre_grado, n.nombre AS nombre_nivel,
              p.observacion,
              to_char(p.fecha_aprobacion AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS fecha_aprobacion,
              p.id_usuario_aprobador
       FROM planes_estudio p
       JOIN anios_academicos aa ON aa.id = p.id_anio_academico
         AND aa.id_institucion_educativa = p.id_institucion_educativa
       JOIN grados_educativos g ON g.id = p.id_grado_educativo
         AND g.id_institucion_educativa = p.id_institucion_educativa
       JOIN niveles_educativos n ON n.id = g.id_nivel_educativo
         AND n.id_institucion_educativa = p.id_institucion_educativa
       ${whereClause}`,
      params,
    );
    const plan = planRows[0];
    if (!plan) return null;

    const detalleRows = await this.ds.query<
      {
        id: string;
        id_asignatura: string;
        codigo_asignatura: string;
        nombre_asignatura: string;
        nombre_area: string;
        tipo: string;
        horas_semanales: number;
        horas_anuales: number;
        orden: number;
        estado: string;
        observacion: string | null;
      }[]
    >(
      `SELECT d.id, d.id_asignatura, a.codigo AS codigo_asignatura,
              a.nombre AS nombre_asignatura, ac.nombre AS nombre_area,
              d.tipo, d.horas_semanales, d.horas_anuales,
              d.orden, d.estado, d.observacion
       FROM detalles_plan_estudio d
       JOIN asignaturas a ON a.id = d.id_asignatura
         AND a.id_institucion_educativa = d.id_institucion_educativa
       JOIN areas_curriculares ac ON ac.id = a.id_area_curricular
         AND ac.id_institucion_educativa = d.id_institucion_educativa
       WHERE d.id_plan_estudio = $1
       ORDER BY d.orden`,
      [plan.id],
    );

    const detalles: DetallePlanResumen[] = detalleRows.map((d) => ({
      id: d.id,
      idAsignatura: d.id_asignatura,
      codigoAsignatura: d.codigo_asignatura,
      nombreAsignatura: d.nombre_asignatura,
      nombreAreaCurricular: d.nombre_area,
      tipo: d.tipo as 'OBLIGATORIA' | 'ELECTIVA',
      horasSemanales: Number(d.horas_semanales),
      horasAnuales: Number(d.horas_anuales),
      orden: Number(d.orden),
      estado: d.estado as 'ACTIVO' | 'INACTIVO',
      observacion: d.observacion,
    }));

    const activos = detalles.filter((d) => d.estado === 'ACTIVO');
    return {
      id: plan.id,
      codigo: plan.codigo,
      nombre: plan.nombre,
      version: plan.version,
      estado: plan.estado as EstadoPlan,
      idAnioAcademico: plan.id_anio_academico,
      anio: plan.anio,
      idGradoEducativo: plan.id_grado_educativo,
      nombreGrado: plan.nombre_grado,
      nombreNivel: plan.nombre_nivel,
      observacion: plan.observacion,
      fechaAprobacion: plan.fecha_aprobacion,
      idUsuarioAprobador: plan.id_usuario_aprobador,
      totalAsignaturasActivas: activos.length,
      totalHorasSemanales: activos.reduce((s, d) => s + d.horasSemanales, 0),
      totalHorasAnuales: activos.reduce((s, d) => s + d.horasAnuales, 0),
      detalles,
    };
  }
}
