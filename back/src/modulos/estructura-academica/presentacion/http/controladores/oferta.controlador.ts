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
import { AuditoriaEstructuraAcademicaInterceptor } from '../interceptores/auditoria-estructura-academica.interceptor';
import { alcanceDesdeContexto } from '../alcance-desde-contexto';
import { CrearOfertaGradoSedeCasoUso } from '../../../aplicacion/oferta/crear-oferta-grado-sede.caso-uso';
import { ActualizarOfertaGradoSedeCasoUso } from '../../../aplicacion/oferta/actualizar-oferta-grado-sede.caso-uso';
import { CambiarEstadoOfertaGradoSedeCasoUso } from '../../../aplicacion/oferta/cambiar-estado-oferta-grado-sede.caso-uso';
import { ListarOfertasCasoUso } from '../../../aplicacion/oferta/listar-ofertas.caso-uso';
import { CrearSeccionAcademicaCasoUso } from '../../../aplicacion/oferta/crear-seccion-academica.caso-uso';
import { ActualizarSeccionAcademicaCasoUso } from '../../../aplicacion/oferta/actualizar-seccion-academica.caso-uso';
import { CambiarEstadoSeccionAcademicaCasoUso } from '../../../aplicacion/oferta/cambiar-estado-seccion-academica.caso-uso';
import { AsignarEspacioSeccionCasoUso } from '../../../aplicacion/oferta/asignar-espacio-seccion.caso-uso';
import { AsignarTutorSeccionCasoUso } from '../../../aplicacion/oferta/asignar-tutor-seccion.caso-uso';
import { ListarSeccionesCasoUso } from '../../../aplicacion/oferta/listar-secciones.caso-uso';
import {
  ActualizarOfertaGradoSedeSolicitud,
  CambiarEstadoOfertaSolicitud,
  CrearOfertaGradoSedeSolicitud,
} from '../solicitudes/oferta-grado-sede.solicitud';
import {
  ActualizarSeccionAcademicaSolicitud,
  AsignarEspacioSeccionSolicitud,
  AsignarTutorSeccionSolicitud,
  CambiarEstadoSeccionSolicitud,
  CrearSeccionAcademicaSolicitud,
} from '../solicitudes/seccion-academica.solicitud';
import { ListarOfertasQueryDto } from '../solicitudes/consultas.solicitud';

@UseInterceptors(AuditoriaEstructuraAcademicaInterceptor)
@Controller('estructura-academica')
export class OfertaControlador {
  constructor(
    private readonly crearOferta: CrearOfertaGradoSedeCasoUso,
    private readonly actualizarOferta: ActualizarOfertaGradoSedeCasoUso,
    private readonly cambiarEstadoOferta: CambiarEstadoOfertaGradoSedeCasoUso,
    private readonly listarOfertas: ListarOfertasCasoUso,
    private readonly crearSeccion: CrearSeccionAcademicaCasoUso,
    private readonly actualizarSeccion: ActualizarSeccionAcademicaCasoUso,
    private readonly cambiarEstadoSeccion: CambiarEstadoSeccionAcademicaCasoUso,
    private readonly asignarEspacio: AsignarEspacioSeccionCasoUso,
    private readonly asignarTutor: AsignarTutorSeccionCasoUso,
    private readonly listarSecciones: ListarSeccionesCasoUso,
  ) {}

  // ── Ofertas grado-sede ────────────────────────────────────────────────────

  @Permisos('ESTRUCTURA_ACADEMICA.LEER')
  @Get('ofertas')
  async listarOfertasHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() query: ListarOfertasQueryDto,
  ) {
    return this.listarOfertas.ejecutar(
      alcanceDesdeContexto(ctx),
      query.idSede,
      query.idAnio,
      query.estado,
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.OFERTAS.GESTIONAR')
  @Post('ofertas')
  async crearOfertaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Req() req: { correlationId?: string },
    @Body() body: CrearOfertaGradoSedeSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    return this.crearOferta.ejecutar(body, alcance);
  }

  @Permisos('ESTRUCTURA_ACADEMICA.OFERTAS.GESTIONAR')
  @Patch('ofertas/:id')
  async actualizarOfertaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: ActualizarOfertaGradoSedeSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.actualizarOferta.ejecutar({ id, ...body }, alcance);
  }

  @Permisos('ESTRUCTURA_ACADEMICA.OFERTAS.GESTIONAR')
  @Patch('ofertas/:id/estado')
  async cambiarEstadoOfertaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: CambiarEstadoOfertaSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.cambiarEstadoOferta.ejecutar(id, body.estado, alcance);
  }

  // ── Secciones académicas ──────────────────────────────────────────────────

  @Permisos('ESTRUCTURA_ACADEMICA.LEER')
  @Get('ofertas/:idOferta/secciones')
  async listarSeccionesHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idOferta', ParseUUIDPipe) idOferta: string,
  ) {
    return this.listarSecciones.ejecutar(idOferta, alcanceDesdeContexto(ctx));
  }

  @Permisos('ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR')
  @Post('ofertas/:idOferta/secciones')
  async crearSeccionHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idOferta', ParseUUIDPipe) idOferta: string,
    @Req() req: { correlationId?: string },
    @Body() body: CrearSeccionAcademicaSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    return this.crearSeccion.ejecutar(
      { ...body, idOfertaGradoSede: idOferta },
      alcance,
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR')
  @Patch('ofertas/:idOferta/secciones/:id')
  async actualizarSeccionHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idOferta', ParseUUIDPipe) idOferta: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: ActualizarSeccionAcademicaSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.actualizarSeccion.ejecutar(
      { id, idOfertaGradoSede: idOferta, ...body },
      alcance,
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR')
  @Patch('secciones/:id/estado')
  async cambiarEstadoSeccionHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: CambiarEstadoSeccionSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.cambiarEstadoSeccion.ejecutar(id, body.estado, alcance);
  }

  @Permisos('ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR')
  @Patch('secciones/:id/espacio')
  async asignarEspacioSeccionHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: AsignarEspacioSeccionSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.asignarEspacio.ejecutar(
      id,
      body.idEspacioFisico ?? null,
      alcance,
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR')
  @Patch('secciones/:id/tutor')
  async asignarTutorSeccionHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: AsignarTutorSeccionSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.asignarTutor.ejecutar(id, body.idDocenteTutor ?? null, alcance);
  }
}
