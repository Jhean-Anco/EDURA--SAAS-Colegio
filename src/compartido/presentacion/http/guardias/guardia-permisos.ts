import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISOS_REQUERIDOS } from '../decoradores/permisos.decorador';
import { PayloadAcceso } from '../../../../modulos/identidad-acceso/dominio/valores/payload-acceso';

@Injectable()
export class GuardiaPermisos implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const permisos = this.reflector.getAllAndOverride<string[]>(
      PERMISOS_REQUERIDOS,
      [contexto.getHandler(), contexto.getClass()],
    );
    if (!permisos || permisos.length === 0) {
      return true;
    }
    const request = contexto
      .switchToHttp()
      .getRequest<Request & { usuario?: PayloadAcceso }>();
    const usuario = request.usuario;
    if (!usuario || usuario.tipoToken !== 'ACCESO') {
      throw new ForbiddenException('PERMISO_DENEGADO');
    }
    if (usuario.ambito === null) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    const requierePersona = permisos.some((permiso) =>
      permiso.startsWith('PERSONAS.'),
    );
    if (requierePersona && usuario.ambito === 'PLATAFORMA') {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    return true;
  }
}
