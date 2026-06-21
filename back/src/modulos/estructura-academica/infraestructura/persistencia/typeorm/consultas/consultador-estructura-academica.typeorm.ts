import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AnioAcademicoResumen,
  ConsultadorEstructuraAcademica,
  EstadoCalendario,
  EstadoNivel,
  EstadoOferta,
  EstadoSeccion,
  GradoEducativoResumen,
  NivelEducativoResumen,
  OfertaGradoSedeResumen,
  PeriodoAcademicoResumen,
  PeriodoActivoPanel,
  SeccionAcademicaResumen,
  TipoPeriodo,
} from '../../../../dominio/puertos/estructura-academica.puerto';

interface FilaAnio {
  id: string;
  anio: number;
  codigo: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

interface FilaPeriodo {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  orden: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  id_anio_academico: string;
}

interface FilaNivel {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  estado: string;
}

interface FilaGrado {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  estado: string;
  id_nivel_educativo: string;
  nombre_nivel: string;
}

interface FilaOferta {
  id: string;
  id_sede: string;
  nombre_sede: string;
  id_grado_educativo: string;
  nombre_grado: string;
  id_anio_academico: string;
  anio: number;
  capacidad_referencial: number | null;
  estado: string;
}

interface FilaSeccion {
  id: string;
  codigo: string;
  nombre: string;
  turno: string;
  capacidad_maxima: number | null;
  estado: string;
  id_oferta_grado_sede: string;
  id_docente_tutor: string | null;
  nombre_docente_tutor: string | null;
  id_espacio_fisico: string | null;
  nombre_espacio_fisico: string | null;
}

interface FilaPeriodoActivo {
  id: string;
  nombre: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  anio: number;
}

@Injectable()
export class ConsultadorEstructuraAcademicaTypeorm implements ConsultadorEstructuraAcademica {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async listarAnios(
    institucionId: string,
    estado?: EstadoCalendario | null,
  ): Promise<AnioAcademicoResumen[]> {
    const rows = await this.ds.query<FilaAnio[]>(
      `SELECT id, anio, codigo, nombre, fecha_inicio::text AS fecha_inicio,
              fecha_fin::text AS fecha_fin, estado
       FROM anios_academicos
       WHERE id_institucion_educativa = $1
         AND ($2::text IS NULL OR estado = $2)
       ORDER BY anio DESC`,
      [institucionId, estado ?? null],
    );
    return rows.map((r) => ({
      id: r.id,
      anio: r.anio,
      codigo: r.codigo,
      nombre: r.nombre,
      fechaInicio: r.fecha_inicio,
      fechaFin: r.fecha_fin,
      estado: r.estado as EstadoCalendario,
    }));
  }

  async listarPeriodos(
    idAnio: string,
    institucionId: string,
    estado?: EstadoCalendario | null,
  ): Promise<PeriodoAcademicoResumen[]> {
    const rows = await this.ds.query<FilaPeriodo[]>(
      `SELECT id, codigo, nombre, tipo, orden,
              fecha_inicio::text AS fecha_inicio,
              fecha_fin::text AS fecha_fin,
              estado, id_anio_academico
       FROM periodos_academicos
       WHERE id_anio_academico = $1 AND id_institucion_educativa = $2
         AND ($3::text IS NULL OR estado = $3)
       ORDER BY orden ASC, fecha_inicio ASC`,
      [idAnio, institucionId, estado ?? null],
    );
    return rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      tipo: r.tipo as TipoPeriodo,
      orden: r.orden,
      fechaInicio: r.fecha_inicio,
      fechaFin: r.fecha_fin,
      estado: r.estado as EstadoCalendario,
      idAnioAcademico: r.id_anio_academico,
    }));
  }

  async listarNiveles(
    institucionId: string,
    estado?: EstadoNivel | null,
  ): Promise<NivelEducativoResumen[]> {
    const rows = await this.ds.query<FilaNivel[]>(
      `SELECT id, codigo, nombre, orden, estado
       FROM niveles_educativos
       WHERE id_institucion_educativa = $1
         AND ($2::text IS NULL OR estado = $2)
       ORDER BY orden ASC, nombre ASC`,
      [institucionId, estado ?? null],
    );
    return rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      orden: r.orden,
      estado: r.estado as EstadoNivel,
    }));
  }

  async listarGrados(
    institucionId: string,
    idNivel?: string | null,
    estado?: EstadoNivel | null,
  ): Promise<GradoEducativoResumen[]> {
    const rows = await this.ds.query<FilaGrado[]>(
      `SELECT g.id, g.codigo, g.nombre, g.orden, g.estado,
              g.id_nivel_educativo, n.nombre AS nombre_nivel
       FROM grados_educativos g
       JOIN niveles_educativos n
         ON n.id = g.id_nivel_educativo
        AND n.id_institucion_educativa = g.id_institucion_educativa
       WHERE g.id_institucion_educativa = $1
         AND ($2::uuid IS NULL OR g.id_nivel_educativo = $2)
         AND ($3::text IS NULL OR g.estado = $3)
       ORDER BY n.orden ASC, g.orden ASC, g.nombre ASC`,
      [institucionId, idNivel ?? null, estado ?? null],
    );
    return rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      orden: r.orden,
      estado: r.estado as EstadoNivel,
      idNivelEducativo: r.id_nivel_educativo,
      nombreNivel: r.nombre_nivel,
    }));
  }

  async listarOfertas(
    institucionId: string,
    idSede?: string | null,
    idAnio?: string | null,
    estado?: EstadoOferta | null,
  ): Promise<OfertaGradoSedeResumen[]> {
    const rows = await this.ds.query<FilaOferta[]>(
      `SELECT o.id, o.id_sede, s.nombre AS nombre_sede,
              o.id_grado_educativo, g.nombre AS nombre_grado,
              o.id_anio_academico, a.anio,
              o.capacidad_referencial, o.estado
       FROM ofertas_grado_sede o
       JOIN sedes s
         ON s.id = o.id_sede
        AND s.id_institucion_educativa = o.id_institucion_educativa
       JOIN grados_educativos g
         ON g.id = o.id_grado_educativo
        AND g.id_institucion_educativa = o.id_institucion_educativa
       JOIN anios_academicos a
         ON a.id = o.id_anio_academico
        AND a.id_institucion_educativa = o.id_institucion_educativa
       WHERE o.id_institucion_educativa = $1
         AND ($2::uuid IS NULL OR o.id_sede = $2)
         AND ($3::uuid IS NULL OR o.id_anio_academico = $3)
         AND ($4::text IS NULL OR o.estado = $4)
       ORDER BY a.anio DESC, s.nombre ASC, g.orden ASC`,
      [institucionId, idSede ?? null, idAnio ?? null, estado ?? null],
    );
    return rows.map((r) => ({
      id: r.id,
      idSede: r.id_sede,
      nombreSede: r.nombre_sede,
      idGradoEducativo: r.id_grado_educativo,
      nombreGrado: r.nombre_grado,
      idAnioAcademico: r.id_anio_academico,
      anio: r.anio,
      capacidadReferencial: r.capacidad_referencial,
      estado: r.estado as EstadoOferta,
    }));
  }

  async listarSecciones(
    idOferta: string,
    institucionId: string,
    sedeId?: string | null,
  ): Promise<SeccionAcademicaResumen[]> {
    const rows = await this.ds.query<FilaSeccion[]>(
      `SELECT sa.id, sa.codigo, sa.nombre, sa.turno, sa.capacidad_maxima, sa.estado,
              sa.id_oferta_grado_sede, sa.id_docente_tutor,
              CASE WHEN d.id IS NOT NULL
                 THEN concat(p.nombres, ' ', p.apellido_paterno)
                 ELSE NULL
              END AS nombre_docente_tutor,
              sa.id_espacio_fisico, ei.nombre AS nombre_espacio_fisico
       FROM secciones_academicas sa
       JOIN ofertas_grado_sede ogs
         ON ogs.id = sa.id_oferta_grado_sede
        AND ($3::uuid IS NULL OR ogs.id_sede = $3)
       LEFT JOIN docentes d
         ON d.id = sa.id_docente_tutor
        AND d.id_institucion_educativa = sa.id_institucion_educativa
       LEFT JOIN personas p ON p.id = d.id_persona
       LEFT JOIN elementos_infraestructura ei ON ei.id = sa.id_espacio_fisico
       WHERE sa.id_oferta_grado_sede = $1
         AND sa.id_institucion_educativa = $2
       ORDER BY sa.nombre ASC`,
      [idOferta, institucionId, sedeId ?? null],
    );
    return rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      turno: r.turno,
      capacidadMaxima: r.capacidad_maxima,
      estado: r.estado as EstadoSeccion,
      idOfertaGradoSede: r.id_oferta_grado_sede,
      idDocenteTutor: r.id_docente_tutor,
      nombreDocenteTutor: r.nombre_docente_tutor,
      idEspacioFisico: r.id_espacio_fisico,
      nombreEspacioFisico: r.nombre_espacio_fisico,
    }));
  }

  async obtenerPeriodoActivo(
    institucionId: string,
  ): Promise<PeriodoActivoPanel | null> {
    const rows = await this.ds.query<FilaPeriodoActivo[]>(
      `SELECT p.id, p.nombre, p.tipo,
              p.fecha_inicio::text AS fecha_inicio,
              p.fecha_fin::text AS fecha_fin,
              a.anio
       FROM periodos_academicos p
       JOIN anios_academicos a
         ON a.id = p.id_anio_academico
        AND a.id_institucion_educativa = p.id_institucion_educativa
       WHERE p.id_institucion_educativa = $1
         AND p.estado = 'ACTIVO'
       LIMIT 1`,
      [institucionId],
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      nombre: r.nombre,
      tipo: r.tipo as TipoPeriodo,
      fechaInicio: r.fecha_inicio,
      fechaFin: r.fecha_fin,
      anio: r.anio,
    };
  }
}
