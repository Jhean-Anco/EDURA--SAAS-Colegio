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
import { CrearAnioAcademicoCasoUso } from '../../../aplicacion/calendario/crear-anio-academico.caso-uso';
import { ActualizarAnioAcademicoCasoUso } from '../../../aplicacion/calendario/actualizar-anio-academico.caso-uso';
import { CambiarEstadoAnioAcademicoCasoUso } from '../../../aplicacion/calendario/cambiar-estado-anio-academico.caso-uso';
import { ListarAniosAcademicosCasoUso } from '../../../aplicacion/calendario/listar-anios-academicos.caso-uso';
import { CrearPeriodoAcademicoCasoUso } from '../../../aplicacion/calendario/crear-periodo-academico.caso-uso';
import { ActualizarPeriodoAcademicoCasoUso } from '../../../aplicacion/calendario/actualizar-periodo-academico.caso-uso';
import { CambiarEstadoPeriodoAcademicoCasoUso } from '../../../aplicacion/calendario/cambiar-estado-periodo-academico.caso-uso';
import { ListarPeriodosAcademicosCasoUso } from '../../../aplicacion/calendario/listar-periodos-academicos.caso-uso';
import {
  ActualizarAnioAcademicoSolicitud,
  CambiarEstadoAnioSolicitud,
  CrearAnioAcademicoSolicitud,
} from '../solicitudes/anio-academico.solicitud';
import {
  ActualizarPeriodoAcademicoSolicitud,
  CambiarEstadoPeriodoSolicitud,
  CrearPeriodoAcademicoSolicitud,
} from '../solicitudes/periodo-academico.solicitud';
import { EstadoCalendario } from '../../../dominio/puertos/estructura-academica.puerto';

@UseInterceptors(AuditoriaEstructuraAcademicaInterceptor)
@Controller('estructura-academica')
export class CalendarioControlador {
  constructor(
    private readonly crearAnio: CrearAnioAcademicoCasoUso,
    private readonly actualizarAnio: ActualizarAnioAcademicoCasoUso,
    private readonly cambiarEstadoAnio: CambiarEstadoAnioAcademicoCasoUso,
    private readonly listarAnios: ListarAniosAcademicosCasoUso,
    private readonly crearPeriodo: CrearPeriodoAcademicoCasoUso,
    private readonly actualizarPeriodo: ActualizarPeriodoAcademicoCasoUso,
    private readonly cambiarEstadoPeriodo: CambiarEstadoPeriodoAcademicoCasoUso,
    private readonly listarPeriodos: ListarPeriodosAcademicosCasoUso,
  ) {}

  // ── Años académicos ───────────────────────────────────────────────────────

  @Permisos('ESTRUCTURA_ACADEMICA.LEER')
  @Get('anios')
  async listarAniosHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query('estado') estado?: EstadoCalendario,
  ) {
    return this.listarAnios.ejecutar(alcanceDesdeContexto(ctx), estado);
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR')
  @Post('anios')
  async crearAnioHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Body() body: CrearAnioAcademicoSolicitud,
  ) {
    return this.crearAnio.ejecutar(body, alcanceDesdeContexto(ctx));
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR')
  @Patch('anios/:id')
  async actualizarAnioHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActualizarAnioAcademicoSolicitud,
  ) {
    await this.actualizarAnio.ejecutar(
      { id, ...body },
      alcanceDesdeContexto(ctx),
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR')
  @Patch('anios/:id/estado')
  async cambiarEstadoAnioHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CambiarEstadoAnioSolicitud,
  ) {
    await this.cambiarEstadoAnio.ejecutar(
      id,
      body.estado,
      alcanceDesdeContexto(ctx),
    );
  }

  // ── Períodos académicos ───────────────────────────────────────────────────

  @Permisos('ESTRUCTURA_ACADEMICA.LEER')
  @Get('anios/:idAnio/periodos')
  async listarPeriodosHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idAnio', ParseUUIDPipe) idAnio: string,
    @Query('estado') estado?: EstadoCalendario,
  ) {
    return this.listarPeriodos.ejecutar(
      idAnio,
      alcanceDesdeContexto(ctx),
      estado,
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR')
  @Post('anios/:idAnio/periodos')
  async crearPeriodoHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idAnio', ParseUUIDPipe) idAnio: string,
    @Body() body: CrearPeriodoAcademicoSolicitud,
  ) {
    return this.crearPeriodo.ejecutar(
      { ...body, idAnioAcademico: idAnio },
      alcanceDesdeContexto(ctx),
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR')
  @Patch('anios/:idAnio/periodos/:id')
  async actualizarPeriodoHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idAnio', ParseUUIDPipe) idAnio: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActualizarPeriodoAcademicoSolicitud,
  ) {
    await this.actualizarPeriodo.ejecutar(
      { id, idAnioAcademico: idAnio, ...body },
      alcanceDesdeContexto(ctx),
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR')
  @Patch('anios/:idAnio/periodos/:id/estado')
  async cambiarEstadoPeriodoHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('idAnio', ParseUUIDPipe) idAnio: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CambiarEstadoPeriodoSolicitud,
  ) {
    await this.cambiarEstadoPeriodo.ejecutar(
      id,
      idAnio,
      body.estado,
      alcanceDesdeContexto(ctx),
    );
  }
}
