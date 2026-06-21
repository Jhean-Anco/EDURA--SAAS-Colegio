import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { AuditoriaEstructuraAcademicaInterceptor } from '../interceptores/auditoria-estructura-academica.interceptor';
import { alcanceDesdeContexto } from '../alcance-desde-contexto';
import { CrearOfertaGradoSedeCasoUso } from '../../../aplicacion/oferta/crear-oferta-grado-sede.caso-uso';
import { ActualizarOfertaGradoSedeCasoUso } from '../../../aplicacion/oferta/actualizar-oferta-grado-sede.caso-uso';
import { ListarOfertasCasoUso } from '../../../aplicacion/oferta/listar-ofertas.caso-uso';
import { CrearSeccionAcademicaCasoUso } from '../../../aplicacion/oferta/crear-seccion-academica.caso-uso';
import { ActualizarSeccionAcademicaCasoUso } from '../../../aplicacion/oferta/actualizar-seccion-academica.caso-uso';
import { ListarSeccionesCasoUso } from '../../../aplicacion/oferta/listar-secciones.caso-uso';
import {
  ActualizarOfertaGradoSedeSolicitud,
  CrearOfertaGradoSedeSolicitud,
} from '../solicitudes/oferta-grado-sede.solicitud';
import {
  ActualizarSeccionAcademicaSolicitud,
  CrearSeccionAcademicaSolicitud,
} from '../solicitudes/seccion-academica.solicitud';
import { EstadoOferta } from '../../../dominio/puertos/estructura-academica.puerto';

@UseInterceptors(AuditoriaEstructuraAcademicaInterceptor)
@Controller('estructura-academica')
export class OfertaControlador {
  constructor(
    private readonly crearOferta: CrearOfertaGradoSedeCasoUso,
    private readonly actualizarOferta: ActualizarOfertaGradoSedeCasoUso,
    private readonly listarOfertas: ListarOfertasCasoUso,
    private readonly crearSeccion: CrearSeccionAcademicaCasoUso,
    private readonly actualizarSeccion: ActualizarSeccionAcademicaCasoUso,
    private readonly listarSecciones: ListarSeccionesCasoUso,
  ) {}

  // ── Ofertas grado-sede ────────────────────────────────────────────────────

  @Permisos('ESTRUCTURA_ACADEMICA.LEER')
  @Get('ofertas')
  async listarOfertasHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query('idSede') idSede?: string,
    @Query('idAnio') idAnio?: string,
    @Query('estado') estado?: EstadoOferta,
  ) {
    return this.listarOfertas.ejecutar(
      alcanceDesdeContexto(ctx),
      idSede,
      idAnio,
      estado,
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.OFERTAS.GESTIONAR')
  @Post('ofertas')
  async crearOfertaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Body() body: CrearOfertaGradoSedeSolicitud,
  ) {
    return this.crearOferta.ejecutar(body, alcanceDesdeContexto(ctx));
  }

  @Permisos('ESTRUCTURA_ACADEMICA.OFERTAS.GESTIONAR')
  @Patch('ofertas/:id')
  async actualizarOfertaHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActualizarOfertaGradoSedeSolicitud,
  ) {
    await this.actualizarOferta.ejecutar(
      { id, ...body },
      alcanceDesdeContexto(ctx),
    );
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
    @Body() body: CrearSeccionAcademicaSolicitud,
  ) {
    return this.crearSeccion.ejecutar(
      { ...body, idOfertaGradoSede: idOferta },
      alcanceDesdeContexto(ctx),
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR')
  @Patch('ofertas/:idOferta/secciones/:id')
  async actualizarSeccionHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idOferta', ParseUUIDPipe) idOferta: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActualizarSeccionAcademicaSolicitud,
  ) {
    await this.actualizarSeccion.ejecutar(
      { id, ...body },
      alcanceDesdeContexto(ctx),
    );
  }
}
