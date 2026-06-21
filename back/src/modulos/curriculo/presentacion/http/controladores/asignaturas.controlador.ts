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
  UseInterceptors,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { AuditoriaCurriculoInterceptor } from '../interceptores/auditoria-curriculo.interceptor';
import { alcanceDesdeContexto } from '../alcance-desde-contexto';
import { CrearAsignaturaCasoUso } from '../../../aplicacion/asignaturas/crear-asignatura.caso-uso';
import { ActualizarAsignaturaCasoUso } from '../../../aplicacion/asignaturas/actualizar-asignatura.caso-uso';
import { CambiarEstadoAsignaturaCasoUso } from '../../../aplicacion/asignaturas/cambiar-estado-asignatura.caso-uso';
import { ListarAsignaturasConsulta } from '../../../aplicacion/asignaturas/listar-asignaturas.consulta';
import { ObtenerAsignaturaConsulta } from '../../../aplicacion/asignaturas/obtener-asignatura.consulta';
import {
  CrearAsignaturaSolicitud,
  ActualizarAsignaturaSolicitud,
  CambiarEstadoAsignaturaSolicitud,
} from '../solicitudes/asignatura.solicitud';
import { ListarAsignaturasQueryDto } from '../solicitudes/consultas-curriculo.solicitud';

@UseInterceptors(AuditoriaCurriculoInterceptor)
@Controller('curriculo')
export class AsignaturasControlador {
  constructor(
    private readonly crearAsignatura: CrearAsignaturaCasoUso,
    private readonly actualizarAsignatura: ActualizarAsignaturaCasoUso,
    private readonly cambiarEstadoAsignatura: CambiarEstadoAsignaturaCasoUso,
    private readonly listarAsignaturas: ListarAsignaturasConsulta,
    private readonly obtenerAsignatura: ObtenerAsignaturaConsulta,
  ) {}

  @Permisos('CURRICULO.LEER')
  @Get('asignaturas')
  async listarAsignaturasHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() query: ListarAsignaturasQueryDto,
  ) {
    return this.listarAsignaturas.ejecutar(alcanceDesdeContexto(ctx), query.idArea, query.estado);
  }

  @Permisos('CURRICULO.LEER')
  @Get('asignaturas/:id')
  async obtenerAsignaturaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.obtenerAsignatura.ejecutar(id, alcanceDesdeContexto(ctx));
  }

  @Permisos('CURRICULO.CATALOGOS.GESTIONAR')
  @Post('asignaturas')
  async crearAsignaturaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Req() req: { correlationId?: string },
    @Body() body: CrearAsignaturaSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    return this.crearAsignatura.ejecutar(body, alcance);
  }

  @Permisos('CURRICULO.CATALOGOS.GESTIONAR')
  @Patch('asignaturas/:id')
  async actualizarAsignaturaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: ActualizarAsignaturaSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.actualizarAsignatura.ejecutar({ id, ...body }, alcance);
  }

  @Permisos('CURRICULO.CATALOGOS.GESTIONAR')
  @Patch('asignaturas/:id/estado')
  async cambiarEstadoAsignaturaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: CambiarEstadoAsignaturaSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.cambiarEstadoAsignatura.ejecutar(id, body.estado, alcance);
  }
}
