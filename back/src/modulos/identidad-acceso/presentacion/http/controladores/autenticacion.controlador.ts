import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
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
import {
  REPOSITORIO_USUARIOS,
  REPOSITORIO_CREDENCIALES,
} from '../../../dominio/puertos/indice';
import {
  RepositorioUsuarios,
  RepositorioCredenciales,
} from '../../../dominio/puertos/repositorios';
import {
  CONSULTADOR_PERMISOS_EFECTIVOS,
  ConsultadorPermisosEfectivos,
} from '../../../../../compartido/infraestructura/persistencia/consultador-permisos.typeorm';

@Controller('autenticacion')
export class AutenticacionControlador {
  constructor(
    private readonly iniciarSesion: IniciarSesionCasoUso,
    private readonly renovarSesion: RenovarSesionCasoUso,
    private readonly cerrarSesion: CerrarSesionCasoUso,
    private readonly cerrarTodas: CerrarTodasSesionesCasoUso,
    private readonly seleccionarContexto: SeleccionarContextoCasoUso,
    private readonly listarContextos: ListarContextosUsuarioConsulta,
    @Inject(REPOSITORIO_USUARIOS)
    private readonly usuariosRepo: RepositorioUsuarios,
    @Inject(REPOSITORIO_CREDENCIALES)
    private readonly credencialesRepo: RepositorioCredenciales,
    @Inject(CONSULTADOR_PERMISOS_EFECTIVOS)
    private readonly consultadorPermisos: ConsultadorPermisosEfectivos,
  ) {}

  private obtenerUsuario(request: Request): PayloadAcceso {
    const usuario = (
      request as Request & { contextoActual?: ContextoSolicitudAutenticada }
    ).contextoActual;
    if (!usuario) {
      throw new UnauthorizedException('SESION_INVALIDA');
    }
    return {
      sub: usuario.usuarioId,
      sid: usuario.sesionId,
      versionSeguridad: usuario.versionSeguridad,
      tipoToken: usuario.tipoToken,
      ambito: usuario.ambito,
      rolId: usuario.rolId,
      institucionId: usuario.institucionId,
      sedeId: usuario.sedeId,
    };
  }

  @Publico()
  @Throttle({ login: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('iniciar-sesion')
  iniciar(@Body() solicitud: IniciarSesionSolicitud) {
    const correo = solicitud.correo ?? solicitud.email;
    const clave = solicitud.clave ?? solicitud.password;
    if (!correo || !clave) {
      throw new BadRequestException(
        'El correo y la contraseña son obligatorios.',
      );
    }
    return this.iniciarSesion.ejecutar({ correo, clave });
  }

  @Publico()
  @Throttle({ refresh: { limit: 15, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
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

  @HttpCode(HttpStatus.OK)
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

  @Get('sesion-actual')
  async sesionActual(@Req() request: Request) {
    const usuarioPayload = this.obtenerUsuario(request);
    const usuario = await this.usuariosRepo.buscarPorId(usuarioPayload.sub);
    if (!usuario) {
      throw new UnauthorizedException('USUARIO_NO_ENCONTRADO');
    }
    const credencial = await this.credencialesRepo.obtenerHashPorUsuario(usuario.id);
    const requiereCambioClave = credencial ? credencial.requiereCambio : false;

    let permisosEfectivos: string[] = [];
    if (usuarioPayload.rolId) {
      permisosEfectivos = await this.consultadorPermisos.listar({
        usuarioId: usuario.id,
        rolId: usuarioPayload.rolId,
        institucionId: usuarioPayload.institucionId,
        sedeId: usuarioPayload.sedeId,
      });
    }

    return {
      usuario: {
        id: usuario.id,
        nombreMostrado: usuario.nombreMostrado,
        correo: usuario.correo,
      },
      contexto: usuarioPayload.ambito ? {
        ambito: usuarioPayload.ambito,
        rolId: usuarioPayload.rolId,
        institucionId: usuarioPayload.institucionId,
        sedeId: usuarioPayload.sedeId,
      } : null,
      permisos: permisosEfectivos,
      versionSeguridad: usuario.versionSeguridad,
      requiereCambioClave,
    };
  }
}
