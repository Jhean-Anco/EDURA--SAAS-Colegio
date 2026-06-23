import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ES_PUBLICO } from '../../../../../compartido/presentacion/http/decoradores/publico.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { PayloadAcceso } from '../../../dominio/valores/payload-acceso';
import { ServicioTokenAccesoJwt } from '../../../infraestructura/tokens/servicio-token-acceso-jwt';
import {
  REPOSITORIO_SESIONES,
  REPOSITORIO_USUARIOS,
} from '../../../dominio/puertos/indice';
import {
  RepositorioSesiones,
  RepositorioUsuarios,
} from '../../../dominio/puertos/repositorios';

@Injectable()
export class GuardiaJwt implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenAcceso: ServicioTokenAccesoJwt,
    @Inject(REPOSITORIO_SESIONES)
    private readonly sesiones: RepositorioSesiones,
    @Inject(REPOSITORIO_USUARIOS)
    private readonly usuarios: RepositorioUsuarios,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const esPublico =
      this.reflector.getAllAndOverride<boolean>(ES_PUBLICO, [
        contexto.getHandler(),
        contexto.getClass(),
      ]) ?? false;
    if (esPublico) {
      return true;
    }

    const request = contexto.switchToHttp().getRequest<
      Request & {
        contextoActual?: ContextoSolicitudAutenticada;
        usuario?: PayloadAcceso;
      }
    >();

    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null;
    if (!token) {
      throw new UnauthorizedException('SIN_AUTENTICACION');
    }

    let payload: PayloadAcceso;
    try {
      payload = await this.tokenAcceso.verificar(token);
    } catch {
      throw new UnauthorizedException('TOKEN_INVALIDO');
    }

    const sesion = await this.sesiones.buscarPorId(payload.sid);
    if (!sesion || sesion.fechaRevocacion !== null) {
      throw new UnauthorizedException('SESION_INVALIDA');
    }
    if (
      sesion.fechaExpiracion !== null &&
      sesion.fechaExpiracion < new Date()
    ) {
      throw new UnauthorizedException('SESION_EXPIRADA');
    }

    const usuario = await this.usuarios.buscarPorId(payload.sub);
    if (!usuario || usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('USUARIO_INACTIVO');
    }
    if (usuario.versionSeguridad !== payload.versionSeguridad) {
      throw new UnauthorizedException('VERSION_SEGURIDAD_INVALIDA');
    }

    request.contextoActual = {
      usuarioId: payload.sub,
      sesionId: payload.sid,
      versionSeguridad: payload.versionSeguridad,
      tipoToken: payload.tipoToken,
      ambito: payload.ambito,
      rolId: payload.rolId,
      institucionId: payload.institucionId,
      sedeId: payload.sedeId,
      canalAcceso: payload.canalAcceso,
      institucionAccesoId: payload.institucionAccesoId,
      puntoAccesoId: payload.puntoAccesoId,
    };
    request.usuario = payload;

    return true;
  }
}
