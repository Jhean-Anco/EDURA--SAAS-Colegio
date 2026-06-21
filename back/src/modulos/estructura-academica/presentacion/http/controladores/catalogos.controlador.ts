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
import { CrearNivelEducativoCasoUso } from '../../../aplicacion/catalogos/crear-nivel-educativo.caso-uso';
import { ActualizarNivelEducativoCasoUso } from '../../../aplicacion/catalogos/actualizar-nivel-educativo.caso-uso';
import { ListarNivelesEducativosCasoUso } from '../../../aplicacion/catalogos/listar-niveles-educativos.caso-uso';
import { CrearGradoEducativoCasoUso } from '../../../aplicacion/catalogos/crear-grado-educativo.caso-uso';
import { ActualizarGradoEducativoCasoUso } from '../../../aplicacion/catalogos/actualizar-grado-educativo.caso-uso';
import { ListarGradosEducativosCasoUso } from '../../../aplicacion/catalogos/listar-grados-educativos.caso-uso';
import {
  ActualizarNivelEducativoSolicitud,
  CrearNivelEducativoSolicitud,
} from '../solicitudes/nivel-educativo.solicitud';
import {
  ActualizarGradoEducativoSolicitud,
  CrearGradoEducativoSolicitud,
} from '../solicitudes/grado-educativo.solicitud';
import { EstadoNivel } from '../../../dominio/puertos/estructura-academica.puerto';

@UseInterceptors(AuditoriaEstructuraAcademicaInterceptor)
@Controller('estructura-academica')
export class CatalogosControlador {
  constructor(
    private readonly crearNivel: CrearNivelEducativoCasoUso,
    private readonly actualizarNivel: ActualizarNivelEducativoCasoUso,
    private readonly listarNiveles: ListarNivelesEducativosCasoUso,
    private readonly crearGrado: CrearGradoEducativoCasoUso,
    private readonly actualizarGrado: ActualizarGradoEducativoCasoUso,
    private readonly listarGrados: ListarGradosEducativosCasoUso,
  ) {}

  // ── Niveles educativos ────────────────────────────────────────────────────

  @Permisos('ESTRUCTURA_ACADEMICA.LEER')
  @Get('niveles')
  async listarNivelesHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query('estado') estado?: EstadoNivel,
  ) {
    return this.listarNiveles.ejecutar(alcanceDesdeContexto(ctx), estado);
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR')
  @Post('niveles')
  async crearNivelHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Body() body: CrearNivelEducativoSolicitud,
  ) {
    return this.crearNivel.ejecutar(body, alcanceDesdeContexto(ctx));
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR')
  @Patch('niveles/:id')
  async actualizarNivelHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActualizarNivelEducativoSolicitud,
  ) {
    await this.actualizarNivel.ejecutar(
      { id, ...body },
      alcanceDesdeContexto(ctx),
    );
  }

  // ── Grados educativos ─────────────────────────────────────────────────────

  @Permisos('ESTRUCTURA_ACADEMICA.LEER')
  @Get('grados')
  async listarGradosHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query('idNivel') idNivel?: string,
    @Query('estado') estado?: EstadoNivel,
  ) {
    return this.listarGrados.ejecutar(
      alcanceDesdeContexto(ctx),
      idNivel,
      estado,
    );
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR')
  @Post('grados')
  async crearGradoHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Body() body: CrearGradoEducativoSolicitud,
  ) {
    return this.crearGrado.ejecutar(body, alcanceDesdeContexto(ctx));
  }

  @Permisos('ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR')
  @Patch('grados/:id')
  async actualizarGradoHandler(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActualizarGradoEducativoSolicitud,
  ) {
    await this.actualizarGrado.ejecutar(
      { id, ...body },
      alcanceDesdeContexto(ctx),
    );
  }
}
