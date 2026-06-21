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
import { CrearAreaCurricularCasoUso } from '../../../aplicacion/areas/crear-area-curricular.caso-uso';
import { ActualizarAreaCurricularCasoUso } from '../../../aplicacion/areas/actualizar-area-curricular.caso-uso';
import { CambiarEstadoAreaCurricularCasoUso } from '../../../aplicacion/areas/cambiar-estado-area-curricular.caso-uso';
import { ListarAreasCurricularesConsulta } from '../../../aplicacion/areas/listar-areas-curriculares.consulta';
import { ObtenerAreaCurricularConsulta } from '../../../aplicacion/areas/obtener-area-curricular.consulta';
import {
  CrearAreaCurricularSolicitud,
  ActualizarAreaCurricularSolicitud,
  CambiarEstadoAreaSolicitud,
} from '../solicitudes/area-curricular.solicitud';
import { ListarAreasQueryDto } from '../solicitudes/consultas-curriculo.solicitud';

@UseInterceptors(AuditoriaCurriculoInterceptor)
@Controller('curriculo')
export class AreasControlador {
  constructor(
    private readonly crearArea: CrearAreaCurricularCasoUso,
    private readonly actualizarArea: ActualizarAreaCurricularCasoUso,
    private readonly cambiarEstadoArea: CambiarEstadoAreaCurricularCasoUso,
    private readonly listarAreas: ListarAreasCurricularesConsulta,
    private readonly obtenerArea: ObtenerAreaCurricularConsulta,
  ) {}

  @Permisos('CURRICULO.LEER')
  @Get('areas')
  async listarAreasHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() query: ListarAreasQueryDto,
  ) {
    return this.listarAreas.ejecutar(alcanceDesdeContexto(ctx), query.estado);
  }

  @Permisos('CURRICULO.LEER')
  @Get('areas/:id')
  async obtenerAreaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.obtenerArea.ejecutar(id, alcanceDesdeContexto(ctx));
  }

  @Permisos('CURRICULO.CATALOGOS.GESTIONAR')
  @Post('areas')
  async crearAreaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Req() req: { correlationId?: string },
    @Body() body: CrearAreaCurricularSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    return this.crearArea.ejecutar(body, alcance);
  }

  @Permisos('CURRICULO.CATALOGOS.GESTIONAR')
  @Patch('areas/:id')
  async actualizarAreaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: ActualizarAreaCurricularSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.actualizarArea.ejecutar({ id, ...body }, alcance);
  }

  @Permisos('CURRICULO.CATALOGOS.GESTIONAR')
  @Patch('areas/:id/estado')
  async cambiarEstadoAreaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: CambiarEstadoAreaSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.cambiarEstadoArea.ejecutar(id, body.estado, alcance);
  }
}
