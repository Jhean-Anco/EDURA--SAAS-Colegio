import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CerrarSesionCasoUso } from '../../../aplicacion/autenticacion/cerrar-sesion.caso-uso';
import { CerrarTodasSesionesCasoUso } from '../../../aplicacion/autenticacion/cerrar-todas-sesiones.caso-uso';
import { IniciarSesionCasoUso } from '../../../aplicacion/autenticacion/iniciar-sesion.caso-uso';
import { RenovarSesionCasoUso } from '../../../aplicacion/autenticacion/renovar-sesion.caso-uso';
import { SeleccionarContextoCasoUso } from '../../../aplicacion/autenticacion/seleccionar-contexto.caso-uso';
import { ListarContextosUsuarioConsulta } from '../../../aplicacion/consultas/contexto-acceso';
import { PayloadAcceso } from '../../../dominio/valores/payload-acceso';
import { Publico } from '../../../../../compartido/presentacion/http/decoradores/publico.decorador';
import { IniciarSesionSolicitud } from '../solicitudes/iniciar-sesion.solicitud';
import { RenovarSesionSolicitud } from '../solicitudes/renovar-sesion.solicitud';
import { SeleccionarContextoSolicitud } from '../solicitudes/seleccionar-contexto.solicitud';
import { GuardiaJwt } from '../guardias/guardia-jwt';
import { UseGuards } from '@nestjs/common';

@UseGuards(GuardiaJwt)
@Controller('autenticacion')
export class AutenticacionControlador {
  constructor(
    private readonly iniciarSesion: IniciarSesionCasoUso,
    private readonly renovarSesion: RenovarSesionCasoUso,
    private readonly cerrarSesion: CerrarSesionCasoUso,
    private readonly cerrarTodas: CerrarTodasSesionesCasoUso,
    private readonly seleccionarContexto: SeleccionarContextoCasoUso,
    private readonly listarContextos: ListarContextosUsuarioConsulta,
  ) {}

  private obtenerUsuario(request: Request): PayloadAcceso {
    const usuario = (request as Request & { usuario?: PayloadAcceso }).usuario;
    if (!usuario) {
      throw new UnauthorizedException('SESION_INVALIDA');
    }
    return usuario;
  }

  @Publico()
  @Post('iniciar-sesion')
  iniciar(@Body() solicitud: IniciarSesionSolicitud) {
    return this.iniciarSesion.ejecutar(solicitud);
  }

  @Publico()
  @Post('renovar')
  renovar(@Body() solicitud: RenovarSesionSolicitud) {
    return this.renovarSesion.ejecutar(solicitud);
  }

  @Post('cerrar-sesion')
  cerrar(@Req() request: Request) {
    const usuario = this.obtenerUsuario(request);
    return this.cerrarSesion.ejecutar({
      usuarioId: usuario.sub,
      sesionId: usuario.sid,
    });
  }

  @Post('cerrar-todas-las-sesiones')
  cerrarTodasLasSesiones(@Req() request: Request) {
    const usuario = this.obtenerUsuario(request);
    return this.cerrarTodas.ejecutar({
      usuarioId: usuario.sub,
    });
  }

  @Get('contextos')
  contextos(@Req() request: Request) {
    return this.listarContextos.ejecutar(this.obtenerUsuario(request).sub);
  }

  @Post('seleccionar-contexto')
  seleccionar(
    @Req() request: Request,
    @Body() solicitud: SeleccionarContextoSolicitud,
  ) {
    const usuario = this.obtenerUsuario(request);
    return this.seleccionarContexto.ejecutar({
      usuarioId: usuario.sub,
      sesionId: usuario.sid,
      contexto: solicitud,
      versionSeguridad: usuario.versionSeguridad,
    });
  }
}
