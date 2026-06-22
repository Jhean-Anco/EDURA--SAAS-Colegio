import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { AlcanceAcceso } from '../../../dominio/matriculas/matricula';

// Use Cases & Queries
import { CrearMatriculaBorradorCasoUso } from '../../../aplicacion/matriculas/crear-matricula-borrador.caso-uso';
import { ActualizarMatriculaBorradorCasoUso } from '../../../aplicacion/matriculas/actualizar-matricula-borrador.caso-uso';
import { ActivarMatriculaCasoUso } from '../../../aplicacion/matriculas/activar-matricula.caso-uso';
import { AnularMatriculaCasoUso } from '../../../aplicacion/matriculas/anular-matricula.caso-uso';
import { RetirarMatriculaCasoUso } from '../../../aplicacion/matriculas/retirar-matricula.caso-uso';
import { CambiarSeccionCasoUso } from '../../../aplicacion/matriculas/cambiar-seccion.caso-uso';
import { ObtenerMatriculaConsulta } from '../../../aplicacion/matriculas/obtener-matricula.consulta';
import { ListarMatriculasConsulta } from '../../../aplicacion/matriculas/listar-matriculas.consulta';
import { ListarHistorialEstadosConsulta } from '../../../aplicacion/matriculas/listar-historial-estados.consulta';
import { ListarCambiosSeccionConsulta } from '../../../aplicacion/matriculas/listar-cambios-seccion.consulta';
import { ConsultarCapacidadSeccionConsulta } from '../../../aplicacion/matriculas/consultar-capacidad-seccion.consulta';

// DTOs
import { CrearMatriculaBorradorSolicitud } from '../solicitudes/crear-matricula.solicitud';
import { ActualizarMatriculaBorradorSolicitud } from '../solicitudes/actualizar-matricula.solicitud';
import { AnularMatriculaSolicitud } from '../solicitudes/anular-matricula.solicitud';
import { RetirarMatriculaSolicitud } from '../solicitudes/retirar-matricula.solicitud';
import { CambiarSeccionSolicitud } from '../solicitudes/cambiar-seccion.solicitud';
import { ConsultarMatriculasQueryDto } from '../solicitudes/consultar-matriculas.query';

function alcanceDesdeContexto(
  ctx: ContextoSolicitudAutenticada | undefined,
): AlcanceAcceso {
  if (!ctx || !ctx.institucionId) {
    throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
  }
  if (ctx.ambito === 'SEDE' && ctx.sedeId) {
    return {
      usuarioId: ctx.usuarioId,
      institucionId: ctx.institucionId,
      ambito: 'SEDE',
      sedeId: ctx.sedeId,
    };
  }
  if (ctx.ambito === 'INSTITUCION' || ctx.ambito === 'PLATAFORMA') {
    return {
      usuarioId: ctx.usuarioId,
      institucionId: ctx.institucionId,
      ambito: 'INSTITUCION',
      sedeId: null,
    };
  }
  throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
}

@Controller('matriculas')
export class MatriculasControlador {
  constructor(
    private readonly crearMatriculaCasoUso: CrearMatriculaBorradorCasoUso,
    private readonly actualizarMatriculaCasoUso: ActualizarMatriculaBorradorCasoUso,
    private readonly activarMatriculaCasoUso: ActivarMatriculaCasoUso,
    private readonly anularMatriculaCasoUso: AnularMatriculaCasoUso,
    private readonly retirarMatriculaCasoUso: RetirarMatriculaCasoUso,
    private readonly cambiarSeccionCasoUso: CambiarSeccionCasoUso,
    private readonly obtenerMatriculaConsulta: ObtenerMatriculaConsulta,
    private readonly listarMatriculasConsulta: ListarMatriculasConsulta,
    private readonly listarHistorialEstadosConsulta: ListarHistorialEstadosConsulta,
    private readonly listarCambiosSeccionConsulta: ListarCambiosSeccionConsulta,
    private readonly consultarCapacidadSeccionConsulta: ConsultarCapacidadSeccionConsulta,
    private readonly dataSource: DataSource,
  ) {}

  private async validarPropiedadMatricula(
    c: AlcanceAcceso,
    rolId: string,
    matriculaId: string,
  ): Promise<void> {
    const query = `
      SELECT r.codigo as "rolCodigo", m.id_persona as "personaId"
      FROM asignaciones_rol_usuario a
      JOIN roles r ON a.id_rol = r.id
      JOIN membresias_institucion m ON a.id_membresia_institucion = m.id
      WHERE a.id_usuario = $1 AND m.id_institucion_educativa = $2 AND a.id_rol = $3
    `;
    const res = await this.dataSource.query(query, [c.usuarioId, c.institucionId, rolId]);
    if (!res || res.length === 0) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    const { rolCodigo, personaId } = res[0];

    if (rolCodigo === 'ESTUDIANTE') {
      const matriculaRes = await this.dataSource.query(
        `SELECT m.id 
         FROM matriculas m
         JOIN estudiantes e ON m.id_estudiante = e.id
         WHERE e.id_persona = $1 AND m.id = $2 AND m.id_institucion_educativa = $3`,
        [personaId, matriculaId, c.institucionId]
      );
      if (!matriculaRes || matriculaRes.length === 0) {
        throw new ForbiddenException('ACCESO_DENEGADO');
      }
    } else if (rolCodigo === 'APODERADO') {
      const matriculaRes = await this.dataSource.query(
        `SELECT m.id 
         FROM matriculas m
         JOIN apoderados_estudiante ae ON m.id_estudiante = ae.id_estudiante
         WHERE ae.id_persona = $1 AND m.id = $2 AND m.id_institucion_educativa = $3`,
        [personaId, matriculaId, c.institucionId]
      );
      if (!matriculaRes || matriculaRes.length === 0) {
        throw new ForbiddenException('ACCESO_DENEGADO');
      }
    }
  }

  @Permisos('MATRICULAS.LEER', 'MATRICULAS.MI_MATRICULA.LEER', 'APODERADOS.MATRICULAS_ASOCIADAS.LEER')
  @Get()
  async listar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() query: ConsultarMatriculasQueryDto,
  ) {
    const c = alcanceDesdeContexto(ctx);
    if (!ctx) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }

    const checkRes = await this.dataSource.query(
      `SELECT r.codigo as "rolCodigo", m.id_persona as "personaId"
       FROM asignaciones_rol_usuario a
       JOIN roles r ON a.id_rol = r.id
       JOIN membresias_institucion m ON a.id_membresia_institucion = m.id
       WHERE a.id_usuario = $1 AND m.id_institucion_educativa = $2 AND a.id_rol = $3`,
      [ctx.usuarioId, c.institucionId, ctx.rolId]
    );
    if (!checkRes || checkRes.length === 0) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    const { rolCodigo, personaId } = checkRes[0];

    if (rolCodigo === 'ESTUDIANTE') {
      const studentRes = await this.dataSource.query(
        `SELECT id FROM estudiantes WHERE id_persona = $1 AND id_institucion_educativa = $2`,
        [personaId, c.institucionId]
      );
      if (!studentRes || studentRes.length === 0) {
        return { total: 0, paginas: 0, pagina: 1, limite: 20, data: [] };
      }
      query.idEstudiante = studentRes[0].id;
    } else if (rolCodigo === 'APODERADO') {
      const parentRes = await this.dataSource.query(
        `SELECT id_estudiante as "id" FROM apoderados_estudiante WHERE id_persona = $1 AND id_institucion_educativa = $2`,
        [personaId, c.institucionId]
      );
      if (!parentRes || parentRes.length === 0) {
        return { total: 0, paginas: 0, pagina: 1, limite: 20, data: [] };
      }
      const studentIds = parentRes.map((r: any) => r.id);
      const result = await this.listarMatriculasConsulta.ejecutar(query, c);
      result.data = result.data.filter((mat: any) => studentIds.includes(mat.idEstudiante));
      result.total = result.data.length;
      return result;
    }

    return this.listarMatriculasConsulta.ejecutar(
      query,
      c,
    );
  }

  @Permisos('MATRICULAS.LEER')
  @Get('secciones/:idSeccion/capacidad')
  async consultarCapacidad(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idSeccion', ParseUUIDPipe) idSeccion: string,
  ) {
    return this.consultarCapacidadSeccionConsulta.ejecutar(
      idSeccion,
      alcanceDesdeContexto(ctx),
    );
  }

  @Permisos('MATRICULAS.LEER', 'MATRICULAS.MI_MATRICULA.LEER', 'APODERADOS.MATRICULAS_ASOCIADAS.LEER')
  @Get(':id')
  async obtener(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const c = alcanceDesdeContexto(ctx);
    if (!ctx) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    await this.validarPropiedadMatricula(c, ctx.rolId, id);
    return this.obtenerMatriculaConsulta.ejecutar(
      id,
      c,
    );
  }

  @Permisos('MATRICULAS.GESTIONAR')
  @Post()
  async crear(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Body() body: CrearMatriculaBorradorSolicitud,
    @Req() request: Request,
  ) {
    const correlationId = String(request.headers['x-correlation-id'] ?? '');
    return this.crearMatriculaCasoUso.ejecutar(
      {
        ...body,
        fechaMatricula: new Date(body.fechaMatricula),
      },
      alcanceDesdeContexto(ctx),
      correlationId,
    );
  }

  @Permisos('MATRICULAS.GESTIONAR')
  @Patch(':id')
  async actualizar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActualizarMatriculaBorradorSolicitud,
  ) {
    return this.actualizarMatriculaCasoUso.ejecutar(
      id,
      {
        ...body,
        fechaMatricula: body.fechaMatricula
          ? new Date(body.fechaMatricula)
          : undefined,
      },
      alcanceDesdeContexto(ctx),
    );
  }

  @Permisos('MATRICULAS.ACTIVAR')
  @Post(':id/activar')
  async activar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    const correlationId = String(request.headers['x-correlation-id'] ?? '');
    return this.activarMatriculaCasoUso.ejecutar(
      id,
      alcanceDesdeContexto(ctx),
      correlationId,
    );
  }

  @Permisos('MATRICULAS.ANULAR')
  @Post(':id/anular')
  async anular(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AnularMatriculaSolicitud,
    @Req() request: Request,
  ) {
    const correlationId = String(request.headers['x-correlation-id'] ?? '');
    return this.anularMatriculaCasoUso.ejecutar(
      id,
      body,
      alcanceDesdeContexto(ctx),
      correlationId,
    );
  }

  @Permisos('MATRICULAS.RETIRAR')
  @Post(':id/retirar')
  async retirar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RetirarMatriculaSolicitud,
    @Req() request: Request,
  ) {
    const correlationId = String(request.headers['x-correlation-id'] ?? '');
    return this.retirarMatriculaCasoUso.ejecutar(
      id,
      body,
      alcanceDesdeContexto(ctx),
      correlationId,
    );
  }

  @Permisos('MATRICULAS.CAMBIAR_SECCION')
  @Post(':id/cambiar-seccion')
  async cambiarSeccion(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CambiarSeccionSolicitud,
    @Req() request: Request,
  ) {
    const correlationId = String(request.headers['x-correlation-id'] ?? '');
    return this.cambiarSeccionCasoUso.ejecutar(
      id,
      body,
      alcanceDesdeContexto(ctx),
      correlationId,
    );
  }

  @Permisos('MATRICULAS.LEER', 'MATRICULAS.MI_MATRICULA.LEER', 'APODERADOS.MATRICULAS_ASOCIADAS.LEER')
  @Get(':id/historial-estados')
  async obtenerHistorialEstados(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const c = alcanceDesdeContexto(ctx);
    if (!ctx) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    await this.validarPropiedadMatricula(c, ctx.rolId, id);
    return this.listarHistorialEstadosConsulta.ejecutar(
      id,
      c,
    );
  }

  @Permisos('MATRICULAS.LEER', 'MATRICULAS.MI_MATRICULA.LEER', 'APODERADOS.MATRICULAS_ASOCIADAS.LEER')
  @Get(':id/historial-secciones')
  async obtenerHistorialSecciones(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const c = alcanceDesdeContexto(ctx);
    if (!ctx) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    await this.validarPropiedadMatricula(c, ctx.rolId, id);
    return this.listarCambiosSeccionConsulta.ejecutar(
      id,
      c,
    );
  }
}
