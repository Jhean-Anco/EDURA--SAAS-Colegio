import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EntradaResumenPanelInstitucional,
  PanelInstitucionalConsulta,
} from '../../../../dominio/puertos/panel-institucional.consulta';
import { PanelInstitucionalResumen } from '../../../../dominio/panel-institucional.resumen';

@Injectable()
export class PanelInstitucionalTypeormConsulta implements PanelInstitucionalConsulta {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async obtenerResumen(
    entrada: EntradaResumenPanelInstitucional,
  ): Promise<PanelInstitucionalResumen> {
    const [membresia] = await this.dataSource.query<
      Array<{ estado: string; sedeId: string | null }>
    >(
      `SELECT mi.estado, aru.id_sede AS "sedeId"
       FROM membresias_institucion mi
       LEFT JOIN asignaciones_rol_usuario aru ON aru.id_membresia_institucion = mi.id AND aru.estado = 'ACTIVA'
       WHERE mi.id_usuario = $1
         AND mi.id_institucion_educativa = $2
         AND mi.estado = 'ACTIVA'
       ORDER BY mi.fecha_creacion DESC
       LIMIT 1`,
      [entrada.usuarioId, entrada.institucionId],
    );
    if (!membresia) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }

    if (
      entrada.sedeId &&
      membresia.sedeId &&
      membresia.sedeId !== entrada.sedeId
    ) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }

    const [institucion] = await this.dataSource.query<
      Array<{ id: string; codigo: string; nombre: string }>
    >(
      `SELECT id, codigo, nombre_legal AS "nombre"
         FROM instituciones_educativas
        WHERE id = $1 AND estado = 'ACTIVA'
        LIMIT 1`,
      [entrada.institucionId],
    );
    if (!institucion) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }

    const [sede] = entrada.sedeId
      ? await this.dataSource.query<
          Array<{ id: string; codigo: string; nombre: string }>
        >(
          `SELECT id, codigo, nombre
             FROM sedes
            WHERE id = $1 AND id_institucion_educativa = $2 AND estado = 'ACTIVA'
            LIMIT 1`,
          [entrada.sedeId, entrada.institucionId],
        )
      : [];
    if (entrada.sedeId && !sede) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }

    const sedeId = sede?.id ?? null;
    const [totales] = await this.dataSource.query<
      Array<{
        totalSedesActivas: string;
        totalUsuariosActivos: string;
        totalEspaciosFisicosActivos: string;
      }>
    >(
      `SELECT
         (SELECT COUNT(*)::int FROM sedes s WHERE s.id_institucion_educativa = $1 AND s.estado = 'ACTIVA') AS "totalSedesActivas",
         (SELECT COUNT(DISTINCT mi.id_usuario)::int FROM membresias_institucion mi WHERE mi.id_institucion_educativa = $1 AND mi.estado = 'ACTIVA') AS "totalUsuariosActivos",
         (SELECT COUNT(*)::int
            FROM espacios_fisicos ef
            INNER JOIN elementos_infraestructura ei ON ei.id = ef.id_elemento_infraestructura
            INNER JOIN sedes s ON s.id = ei.id_sede
            WHERE s.id_institucion_educativa = $1 AND ei.estado = 'ACTIVO') AS "totalEspaciosFisicosActivos"`,
      [entrada.institucionId],
    );

    const infraestructuraPorEstado = await this.dataSource.query<
      Array<{ estado: string; total: string }>
    >(
      `SELECT ei.estado, COUNT(*)::int AS total
         FROM elementos_infraestructura ei
         INNER JOIN sedes s ON s.id = ei.id_sede
        WHERE s.id_institucion_educativa = $1
          AND ($2::uuid IS NULL OR ei.id_sede = $2)
        GROUP BY ei.estado
        ORDER BY ei.estado`,
      [entrada.institucionId, sedeId],
    );

    const alertasPendientes = await this.dataSource.query<
      Array<{
        id: string;
        tipo: string;
        titulo: string;
        prioridad: string;
        estado: string;
        moduloOrigen: string;
        fechaGeneracion: Date;
      }>
    >(
      `SELECT id, tipo, titulo, prioridad, estado, modulo_origen AS "moduloOrigen", fecha_generacion AS "fechaGeneracion"
         FROM alertas_institucionales
        WHERE id_institucion_educativa = $1
          AND estado IN ('PENDIENTE', 'EN_REVISION')
          AND ($2::uuid IS NULL OR id_sede = $2)
        ORDER BY CASE prioridad WHEN 'CRITICA' THEN 1 WHEN 'ALTA' THEN 2 WHEN 'MEDIA' THEN 3 ELSE 4 END,
                 fecha_generacion DESC
        LIMIT 10`,
      [entrada.institucionId, sedeId],
    );

    const comunicadosRecientes = await this.dataSource.query<
      Array<{
        id: string;
        titulo: string;
        tipo: string;
        prioridad: string;
        estado: string;
        fechaPublicacion: Date | null;
      }>
    >(
      `SELECT id, titulo, tipo, prioridad, estado, fecha_publicacion AS "fechaPublicacion"
         FROM comunicados_institucionales
        WHERE id_institucion_educativa = $1
          AND estado = 'PUBLICADO'
          AND ($2::uuid IS NULL OR id_sede = $2)
        ORDER BY fecha_publicacion DESC NULLS LAST
        LIMIT 5`,
      [entrada.institucionId, sedeId],
    );

    const periodoAcademico =
      entrada.idPeriodoAcademico != null
        ? { id: entrada.idPeriodoAcademico, nombre: 'Periodo académico' }
        : null;

    return {
      institucion,
      sede,
      periodoAcademico,
      indicadores: {
        totalSedesActivas: Number(totales?.totalSedesActivas ?? 0),
        totalUsuariosActivos: Number(totales?.totalUsuariosActivos ?? 0),
        totalEspaciosFisicosActivos: Number(
          totales?.totalEspaciosFisicosActivos ?? 0,
        ),
        infraestructuraPorEstado: infraestructuraPorEstado.map((fila) => ({
          estado: fila.estado,
          total: Number(fila.total),
        })),
        alertasPendientes: alertasPendientes.map((alerta) => ({
          id: alerta.id,
          tipo: alerta.tipo,
          titulo: alerta.titulo,
          prioridad: alerta.prioridad,
          estado: alerta.estado,
          moduloOrigen: alerta.moduloOrigen,
          fechaGeneracion: new Date(alerta.fechaGeneracion).toISOString(),
        })),
        comunicadosRecientes: comunicadosRecientes.map((comunicado) => ({
          id: comunicado.id,
          titulo: comunicado.titulo,
          tipo: comunicado.tipo,
          prioridad: comunicado.prioridad,
          estado: comunicado.estado,
          fechaPublicacion: comunicado.fechaPublicacion
            ? new Date(comunicado.fechaPublicacion).toISOString()
            : null,
        })),
        totalEstudiantesActivos: null,
        totalDocentesActivos: null,
        matriculasPorEstado: [],
        asistenciaDelDia: null,
      },
      fechaActualizacion: new Date().toISOString(),
    };
  }
}
