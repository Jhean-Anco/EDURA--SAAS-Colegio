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
import { CrearNivelEducativoCasoUso } from '../../../aplicacion/catalogos/crear-nivel-educativo.caso-uso';
import { ActualizarNivelEducativoCasoUso } from '../../../aplicacion/catalogos/actualizar-nivel-educativo.caso-uso';
import { CambiarEstadoNivelEducativoCasoUso } from '../../../aplicacion/catalogos/cambiar-estado-nivel-educativo.caso-uso';
import { ListarNivelesEducativosCasoUso } from '../../../aplicacion/catalogos/listar-niveles-educativos.caso-uso';
import { CrearGradoEducativoCasoUso } from '../../../aplicacion/catalogos/crear-grado-educativo.caso-uso';
import { ActualizarGradoEducativoCasoUso } from '../../../aplicacion/catalogos/actualizar-grado-educativo.caso-uso';
import { CambiarEstadoGradoEducativoCasoUso } from '../../../aplicacion/catalogos/cambiar-estado-grado-educativo.caso-uso';
import { ListarGradosEducativosCasoUso } from '../../../aplicacion/catalogos/listar-grados-educativos.caso-uso';
import {
  ActualizarNivelEducativoSolicitud,
  CambiarEstadoNivelSolicitud,
  CrearNivelEducativoSolicitud,
} from '../solicitudes/nivel-educativo.solicitud';
import {
  ActualizarGradoEducativoSolicitud,
  CambiarEstadoGradoSolicitud,
  CrearGradoEducativoSolicitud,
} from '../solicitudes/grado-educativo.solicitud';
import {
  ListarNivelesQueryDto,
  ListarGradosQueryDto,
} from '../solicitudes/consultas.solicitud';

@UseInterceptors(AuditoriaEstructuraAcademicaInterceptor)
@Controller('estructura-academica')
export class CatalogosControlador {
  constructor(
    private readonly crearNivel: CrearNivelEducativoCasoUso,
    private readonly actualizarNivel: ActualizarNivelEducativoCasoUso,
    private readonly cambiarEstadoNivel: CambiarEstadoNivelEducativoCasoUso,
    private readonly listarNiveles: ListarNivelesEducativosCasoUso,
    private readonly crearGrado: CrearGradoEducativoCasoUso,
    private readonly actualizarGrado: ActualizarGradoEducativoCasoUso,
    private readonly cambiarEstadoGrado: CambiarEstadoGradoEducativoCasoUso,
    private readonly listarGrados: ListarGradosEducativosCasoUso,
  ) {}

  // ── Niveles educativos ────────────────────────────────────────────────────

  @Permisos('ESTRUCTURA_ACADEMICA.LEER')
  @Get('niveles')
  async listarNivelesHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() query: ListarNivelesQueryDto,
  ) {
    return this.listarNiveles.ejecutar(alcanceDesdeContexto(ctx), query.estado);
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR')
  @Post('niveles')
  async crearNivelHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Req() req: { correlationId?: string },
    @Body() body: CrearNivelEducativoSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    return this.crearNivel.ejecutar(body, alcance);
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR')
  @Patch('niveles/:id')
  async actualizarNivelHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: ActualizarNivelEducativoSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.actualizarNivel.ejecutar({ id, ...body }, alcance);
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR')
  @Patch('niveles/:id/estado')
  async cambiarEstadoNivelHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: CambiarEstadoNivelSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.cambiarEstadoNivel.ejecutar(id, body.estado, alcance);
  }

  // ── Grados educativos ─────────────────────────────────────────────────────

  @Permisos('ESTRUCTURA_ACADEMICA.LEER')
  @Get('grados')
  async listarGradosHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() query: ListarGradosQueryDto,
  ) {
    return this.listarGrados.ejecutar(
      alcanceDesdeContexto(ctx),
      query.idNivel,
      query.estado,
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR')
  @Post('grados')
  async crearGradoHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Req() req: { correlationId?: string },
    @Body() body: CrearGradoEducativoSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    return this.crearGrado.ejecutar(body, alcance);
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR')
  @Patch('grados/:id')
  async actualizarGradoHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: ActualizarGradoEducativoSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.actualizarGrado.ejecutar({ id, ...body }, alcance);
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR')
  @Patch('grados/:id/estado')
  async cambiarEstadoGradoHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { correlationId?: string },
    @Body() body: CambiarEstadoGradoSolicitud,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    alcance.correlationId = req.correlationId;
    await this.cambiarEstadoGrado.ejecutar(id, body.estado, alcance);
  }
}
