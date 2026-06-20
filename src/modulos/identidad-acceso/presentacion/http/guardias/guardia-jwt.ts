import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ES_PUBLICO } from '../../../../../compartido/presentacion/http/decoradores/publico.decorador';
import { PayloadAcceso } from '../../../dominio/valores/payload-acceso';
import { ServicioTokenAccesoJwt } from '../../../infraestructura/tokens/servicio-token-acceso-jwt';

@Injectable()
export class GuardiaJwt implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenAcceso: ServicioTokenAccesoJwt,
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
    const request = contexto
      .switchToHttp()
      .getRequest<Request & { usuario?: PayloadAcceso }>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null;
    if (!token) {
      throw new UnauthorizedException('Sin autenticacion.');
    }
    request.usuario = await this.tokenAcceso.verificar(token);
    return true;
  }
}
