import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CerrarSesionCasoUso } from '../../../aplicacion/autenticacion/cerrar-sesion.caso-uso';
import { CerrarTodasSesionesCasoUso } from '../../../aplicacion/autenticacion/cerrar-todas-sesiones.caso-uso';
import { IniciarSesionCasoUso } from '../../../aplicacion/autenticacion/iniciar-sesion.caso-uso';
import { RenovarSesionCasoUso } from '../../../aplicacion/autenticacion/renovar-sesion.caso-uso';
import { ListarContextosUsuarioConsulta } from '../../../aplicacion/consultas/contexto-acceso';
import { IniciarSesionSolicitud } from '../solicitudes/iniciar-sesion.solicitud';
import { RenovarSesionSolicitud } from '../solicitudes/renovar-sesion.solicitud';
import {
  AutenticacionRespuesta,
  RenovacionSesionRespuesta,
} from '../respuestas/autenticacion.respuesta';
import { ContextoAccesoRespuesta } from '../respuestas/contexto-acceso.respuesta';

@Controller('api/v1/autenticacion')
export class AutenticacionControlador {
  constructor(
    private readonly iniciarSesion: IniciarSesionCasoUso,
    private readonly renovarSesion: RenovarSesionCasoUso,
    private readonly cerrarSesion: CerrarSesionCasoUso,
    private readonly cerrarTodas: CerrarTodasSesionesCasoUso,
    private readonly listarContextos: ListarContextosUsuarioConsulta,
    private readonly jwt: JwtService,
  ) {}

  @Post('iniciar-sesion')
  async iniciar(
    @Body() solicitud: IniciarSesionSolicitud,
  ): Promise<AutenticacionRespuesta> {
    return this.iniciarSesion.ejecutar(solicitud);
  }

  @Post('renovar')
  async renovar(
    @Body() solicitud: RenovarSesionSolicitud,
  ): Promise<RenovacionSesionRespuesta> {
    return this.renovarSesion.ejecutar(solicitud);
  }

  @Post('cerrar-sesion')
  async cerrar(
    @Headers('authorization') authorization?: string,
  ): Promise<void> {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null;
    if (!token) {
      throw new UnauthorizedException('Sin autenticacion.');
    }
    const payload = await this.jwt.verifyAsync<{
      sub: string;
      sesionId?: string;
    }>(token, {
      secret: process.env.JWT_SECRETO ?? 'dev-secret',
      issuer: process.env.JWT_EMISOR ?? 'EDURA',
      audience: process.env.JWT_AUDIENCIA ?? 'EDURA_WEB',
    });
    await this.cerrarSesion.ejecutar({
      usuarioId: payload.sub,
      sesionId: payload.sesionId ?? payload.sub,
    });
  }

  @Post('cerrar-todas-las-sesiones')
  async cerrarTodasLasSesiones(
    @Headers('authorization') authorization?: string,
  ): Promise<void> {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null;
    if (!token) {
      throw new UnauthorizedException('Sin autenticacion.');
    }
    const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
      secret: process.env.JWT_SECRETO ?? 'dev-secret',
      issuer: process.env.JWT_EMISOR ?? 'EDURA',
      audience: process.env.JWT_AUDIENCIA ?? 'EDURA_WEB',
    });
    await this.cerrarTodas.ejecutar({ usuarioId: payload.sub });
  }

  @Get('contextos')
  async contextos(
    @Headers('authorization') authorization?: string,
  ): Promise<ContextoAccesoRespuesta[]> {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null;
    if (!token) {
      throw new UnauthorizedException('Sin autenticacion.');
    }
    const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
      secret: process.env.JWT_SECRETO ?? 'dev-secret',
      issuer: process.env.JWT_EMISOR ?? 'EDURA',
      audience: process.env.JWT_AUDIENCIA ?? 'EDURA_WEB',
    });
    const contextos = await this.listarContextos.ejecutar(payload.sub);
    return contextos.map((contexto) => ({
      ambito: contexto.ambito,
      rolId: contexto.rolId,
      rolCodigo: contexto.rolCodigo,
      institucionId: contexto.institucionId,
      institucionNombre: contexto.institucionNombre,
      sedeId: contexto.sedeId,
      sedeNombre: contexto.sedeNombre,
    }));
  }
}
