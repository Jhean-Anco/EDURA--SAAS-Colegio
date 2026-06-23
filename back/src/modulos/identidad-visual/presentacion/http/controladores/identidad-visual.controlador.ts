import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Res,
  Inject,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import { Publico } from '../../../../../compartido/presentacion/http/decoradores/publico.decorador';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';

// Casos de uso
import { ResolverExperienciaAccesoConsulta } from '../../../aplicacion/resolucion/resolver-experiencia-acceso.consulta';
import {
  ObtenerIdentidadVisualConsulta,
  ObtenerBorradorIdentidadConsulta,
  ActualizarBorradorIdentidadCasoUso,
  PublicarIdentidadVisualCasoUso,
  InactivarIdentidadVisualCasoUso,
  CrearActualizarBorradorDto,
} from '../../../aplicacion/identidades/identidad.casos-uso';
import {
  CargarActivoIdentidadCasoUso,
  ArchivarActivoIdentidadCasoUso,
} from '../../../aplicacion/activos/activo.casos-uso';
import {
  ListarPuntosAccesoConsulta,
  CrearPuntoAccesoCasoUso,
  ActualizarPuntoAccesoCasoUso,
  SuspenderPuntoAccesoCasoUso,
  CrearPuntoAccesoDto,
  ActualizarPuntoAccesoDto,
} from '../../../aplicacion/puntos-acceso/punto-acceso.casos-uso';

import { AlmacenamientoActivosLocal } from '../../../infraestructura/almacenamiento/almacenamiento-activos';

@Controller('identidad-visual')
export class IdentidadVisualControlador {
  constructor(
    private readonly resolverExperienciaAcceso: ResolverExperienciaAccesoConsulta,
    private readonly obtenerIdentidadVisual: ObtenerIdentidadVisualConsulta,
    private readonly obtenerBorradorIdentidad: ObtenerBorradorIdentidadConsulta,
    private readonly actualizarBorradorIdentidad: ActualizarBorradorIdentidadCasoUso,
    private readonly publicarIdentidadVisual: PublicarIdentidadVisualCasoUso,
    private readonly inactivarIdentidadVisual: InactivarIdentidadVisualCasoUso,
    private readonly cargarActivoIdentidad: CargarActivoIdentidadCasoUso,
    private readonly archivarActivoIdentidad: ArchivarActivoIdentidadCasoUso,
    private readonly listarPuntosAcceso: ListarPuntosAccesoConsulta,
    private readonly crearPuntoAcceso: CrearPuntoAccesoCasoUso,
    private readonly actualizarPuntoAcceso: ActualizarPuntoAccesoCasoUso,
    private readonly suspenderPuntoAcceso: SuspenderPuntoAccesoCasoUso,
    @Inject('ALMACENAMIENTO_ACTIVOS_IDENTIDAD')
    private readonly almacenamiento: AlmacenamientoActivosLocal,
  ) {}

  private instId(ctx: ContextoSolicitudAutenticada | undefined): string {
    if (!ctx?.institucionId) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    return ctx.institucionId;
  }

  // 1. ENDPOINTS PÚBLICOS (Con prefijo público o directamente mapeados)
  
  @Publico()
  @Get('publico/experiencia-acceso')
  async resolverAccesoPublico(
    @Query('tipo') tipo: string,
    @Query('identificador') identificador: string,
  ) {
    if (!tipo || !identificador) {
      throw new BadRequestException('Los parámetros tipo e identificador son obligatorios.');
    }
    return this.resolverExperienciaAcceso.ejecutar(tipo, identificador);
  }

  @Publico()
  @Get('publico/activos/:clave')
  async servirActivoPublico(@Param('clave') clave: string, @Res() res: Response) {
    const ruta = this.almacenamiento.obtenerRutaArchivo(clave);
    if (!fs.existsSync(ruta)) {
      throw new NotFoundException('Archivo no encontrado.');
    }
    return res.sendFile(ruta);
  }

  // 2. ENDPOINTS ADMINISTRATIVOS (Privados)

  @Permisos('IDENTIDAD_VISUAL.LEER')
  @Get()
  async obtenerIdentidad(@ContextoActual() ctx: ContextoSolicitudAutenticada | undefined) {
    return this.obtenerIdentidadVisual.ejecutar(this.instId(ctx));
  }

  @Permisos('IDENTIDAD_VISUAL.LEER')
  @Get('borrador')
  async obtenerBorrador(@ContextoActual() ctx: ContextoSolicitudAutenticada | undefined) {
    return this.obtenerBorradorIdentidad.ejecutar(this.instId(ctx));
  }

  @Permisos('IDENTIDAD_VISUAL.ACTUALIZAR')
  @Post('borrador')
  async crearBorrador(@ContextoActual() ctx: ContextoSolicitudAutenticada | undefined) {
    return this.obtenerBorradorIdentidad.ejecutar(this.instId(ctx));
  }

  @Permisos('IDENTIDAD_VISUAL.ACTUALIZAR')
  @Patch('borrador')
  async actualizarBorrador(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Body() dto: CrearActualizarBorradorDto,
  ) {
    return this.actualizarBorradorIdentidad.ejecutar(this.instId(ctx), dto, ctx!.usuarioId!);
  }

  @Permisos('IDENTIDAD_VISUAL.PUBLICAR')
  @Post('publicar')
  async publicar(@ContextoActual() ctx: ContextoSolicitudAutenticada | undefined) {
    return this.publicarIdentidadVisual.ejecutar(this.instId(ctx), ctx!.usuarioId!);
  }

  @Permisos('IDENTIDAD_VISUAL.ACTIVOS.GESTIONAR')
  @Post('activos')
  @UseInterceptors(FileInterceptor('archivo'))
  async cargarActivo(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Body('tipo') tipo: 'LOGO_PRINCIPAL' | 'LOGO_HORIZONTAL' | 'LOGO_FONDO_CLARO' | 'LOGO_FONDO_OSCURO' | 'ISOTIPO' | 'FAVICON' | 'FONDO_LOGIN' | 'IMAGEN_PORTADA',
    @Body('textoAlternativo') textoAlternativo: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Debe subir un archivo.');
    }
    return this.cargarActivoIdentidad.ejecutar(
      this.instId(ctx),
      {
        tipo,
        nombreOriginal: file.originalname,
        tipoMime: file.mimetype,
        tamanoBytes: file.size,
        buffer: file.buffer,
        textoAlternativo: textoAlternativo || 'Activo de Identidad Visual',
      },
      ctx!.usuarioId!,
    );
  }

  @Permisos('IDENTIDAD_VISUAL.ACTIVOS.GESTIONAR')
  @Patch('activos/:id/archivar')
  async archivarActivo(@Param('id', ParseUUIDPipe) id: string) {
    return this.archivarActivoIdentidad.ejecutar(id);
  }

  @Permisos('IDENTIDAD_VISUAL.PUNTOS_ACCESO.GESTIONAR')
  @Get('puntos-acceso')
  async listarPuntos(@ContextoActual() ctx: ContextoSolicitudAutenticada | undefined) {
    return this.listarPuntosAcceso.ejecutar(this.instId(ctx));
  }

  @Permisos('IDENTIDAD_VISUAL.PUNTOS_ACCESO.GESTIONAR')
  @Post('puntos-acceso')
  async crearPunto(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Body() dto: CrearPuntoAccesoDto,
  ) {
    return this.crearPuntoAcceso.ejecutar(this.instId(ctx), dto);
  }

  @Permisos('IDENTIDAD_VISUAL.PUNTOS_ACCESO.GESTIONAR')
  @Patch('puntos-acceso/:id')
  async actualizarPunto(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarPuntoAccesoDto,
  ) {
    return this.actualizarPuntoAcceso.ejecutar(this.instId(ctx), id, dto);
  }

  @Permisos('IDENTIDAD_VISUAL.PUNTOS_ACCESO.GESTIONAR')
  @Post('puntos-acceso/:id/suspender')
  async suspenderPunto(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.suspenderPuntoAcceso.ejecutar(this.instId(ctx), id);
  }
}
