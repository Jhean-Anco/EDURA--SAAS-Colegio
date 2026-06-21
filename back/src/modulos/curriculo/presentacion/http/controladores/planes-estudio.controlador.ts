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

import { CrearPlanEstudioCasoUso } from '../../../aplicacion/planes-estudio/crear-plan-estudio.caso-uso';
import { ActualizarPlanEstudioCasoUso } from '../../../aplicacion/planes-estudio/actualizar-plan-estudio.caso-uso';
import { CambiarEstadoPlanEstudioCasoUso } from '../../../aplicacion/planes-estudio/cambiar-estado-plan-estudio.caso-uso';
import { ListarPlanesEstudioConsulta } from '../../../aplicacion/planes-estudio/listar-planes-estudio.consulta';
import { ObtenerPlanEstudioConsulta } from '../../../aplicacion/planes-estudio/obtener-plan-estudio.consulta';
import { ResolverPlanVigenteConsulta } from '../../../aplicacion/planes-estudio/resolver-plan-vigente.consulta';
import { DuplicarPlanEstudioCasoUso } from '../../../aplicacion/planes-estudio/duplicar-plan-estudio.caso-uso';
import { AprobarPlanEstudioCasoUso } from '../../../aplicacion/planes-estudio/aprobar-plan-estudio.caso-uso';
import { AgregarDetallePlanEstudioCasoUso } from '../../../aplicacion/planes-estudio/agregar-detalle-plan-estudio.caso-uso';
import { ActualizarDetallePlanEstudioCasoUso } from '../../../aplicacion/planes-estudio/actualizar-detalle-plan-estudio.caso-uso';
import { CambiarEstadoDetallePlanEstudioCasoUso } from '../../../aplicacion/planes-estudio/cambiar-estado-detalle-plan-estudio.caso-uso';
import { ListarDetallesPlanEstudioConsulta } from '../../../aplicacion/planes-estudio/listar-detalles-plan-estudio.consulta';

import {
  CrearPlanEstudioSolicitud,
  ActualizarPlanEstudioSolicitud,
  CambiarEstadoPlanSolicitud,
  DuplicarPlanEstudioSolicitud,
} from '../solicitudes/plan-estudio.solicitud';
import {
  AgregarDetallePlanSolicitud,
  ActualizarDetallePlanSolicitud,
  CambiarEstadoDetalleSolicitud,
} from '../solicitudes/detalle-plan.solicitud';
import {
  ListarPlanesQueryDto,
  ResolverPlanQueryDto,
} from '../solicitudes/consultas-curriculo.solicitud';

@UseInterceptors(AuditoriaCurriculoInterceptor)
@Controller('curriculo')
export class PlanesEstudioControlador {
  constructor(
    private readonly crearPlan: CrearPlanEstudioCasoUso,
    private readonly actualizarPlan: ActualizarPlanEstudioCasoUso,
    private readonly cambiarEstadoPlan: CambiarEstadoPlanEstudioCasoUso,
    private readonly listarPlanes: ListarPlanesEstudioConsulta,
    private readonly obtenerPlan: ObtenerPlanEstudioConsulta,
    private readonly resolverPlan: ResolverPlanVigenteConsulta,
    private readonly duplicarPlan: DuplicarPlanEstudioCasoUso,
    private readonly aprobarPlan: AprobarPlanEstudioCasoUso,
    private readonly agregarDetalle: AgregarDetallePlanEstudioCasoUso,
    private readonly actualizarDetalle: ActualizarDetallePlanEstudioCasoUso,
    private readonly cambiarEstadoDetalle: CambiarEstadoDetallePlanEstudioCasoUso,
    private readonly listarDetalles: ListarDetallesPlanEstudioConsulta,
  ) {}

  // ── Planes ──────────────────────────────────────────────────────────────────

  @Permisos('CURRICULO.LEER')
  @Get('planes')
  async listarPlanesHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() query: ListarPlanesQueryDto,
  ) {
    return this.listarPlanes.ejecutar(
      alcanceDesdeContexto(ctx),
      query.idAnio,
      query.idGrado,
      query.estado,
    );
  }

  @Permisos('CURRICULO.LEER')
  @Get('planes/resolver')
  async resolverPlanHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() query: ResolverPlanQueryDto,
  ) {
    return this.resolverPlan.ejecutar(
      query.idAnio,
      query.idGrado,
      alcanceDesdeContexto(ctx),
    );
  }

  @Permisos('CURRICULO.LEER')
  @Get('planes/:id')
  async obtenerPlanHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.obtenerPlan.ejecutar(id, alcanceDesdeContexto(ctx));
  }

  @Permisos('CURRICULO.PLANES.GESTIONAR')
  @Post('planes')
  async crearPlanHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Req() req: { correlationId?: string },
    @Body() body: CrearPlanEstudioSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    return this.crearPlan.ejecutar(body, alcance);
  }

  @Permisos('CURRICULO.PLANES.GESTIONAR')
  @Patch('planes/:id')
  async actualizarPlanHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: ActualizarPlanEstudioSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.actualizarPlan.ejecutar({ id, ...body }, alcance);
  }

  @Permisos('CURRICULO.PLANES.CAMBIAR_ESTADO')
  @Patch('planes/:id/estado')
  async cambiarEstadoPlanHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Req() req: { correlationId?: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CambiarEstadoPlanSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.cambiarEstadoPlan.ejecutar(id, body.estado, alcance);
  }

  @Permisos('CURRICULO.PLANES.APROBAR')
  @Post('planes/:id/aprobar')
  async aprobarPlanHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Req() req: { correlationId?: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.aprobarPlan.ejecutar(id, alcance);
  }

  @Permisos('CURRICULO.PLANES.GESTIONAR')
  @Post('planes/:id/duplicar')
  async duplicarPlanHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: DuplicarPlanEstudioSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    return this.duplicarPlan.ejecutar({ idPlanOrigen: id, ...body }, alcance);
  }

  // ── Detalles ────────────────────────────────────────────────────────────────

  @Permisos('CURRICULO.LEER')
  @Get('planes/:idPlan/detalles')
  async listarDetallesHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idPlan', ParseUUIDPipe) idPlan: string,
  ) {
    const plan = await this.listarDetalles.ejecutar(
      idPlan,
      alcanceDesdeContexto(ctx),
    );
    return plan.detalles;
  }

  @Permisos('CURRICULO.PLANES.GESTIONAR')
  @Post('planes/:idPlan/detalles')
  async agregarDetalleHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idPlan', ParseUUIDPipe) idPlan: string,
    @Req() req: { correlationId?: string },
    @Body() body: AgregarDetallePlanSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    return this.agregarDetalle.ejecutar(
      { idPlanEstudio: idPlan, ...body },
      alcance,
    );
  }

  @Permisos('CURRICULO.PLANES.GESTIONAR')
  @Patch('planes/:idPlan/detalles/:idDetalle')
  async actualizarDetalleHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idPlan', ParseUUIDPipe) idPlan: string,
    @Param('idDetalle', ParseUUIDPipe) idDetalle: string,
    @Req() req: { correlationId?: string },
    @Body() body: ActualizarDetallePlanSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.actualizarDetalle.ejecutar(
      { id: idDetalle, idPlanEstudio: idPlan, ...body },
      alcance,
    );
  }

  @Permisos('CURRICULO.PLANES.GESTIONAR')
  @Patch('planes/:idPlan/detalles/:idDetalle/estado')
  async cambiarEstadoDetalleHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idPlan', ParseUUIDPipe) idPlan: string,
    @Param('idDetalle', ParseUUIDPipe) idDetalle: string,
    @Req() req: { correlationId?: string },
    @Body() body: CambiarEstadoDetalleSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.cambiarEstadoDetalle.ejecutar(
      idDetalle,
      idPlan,
      body.estado,
      alcance,
    );
  }
}
