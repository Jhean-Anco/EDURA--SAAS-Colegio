import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISOS_REQUERIDOS } from '../decoradores/permisos.decorador';
import { ContextoSolicitudAutenticada } from '../../../aplicacion/contexto-solicitud-autenticada';
import {
  CONSULTADOR_PERMISOS_EFECTIVOS,
  ConsultadorPermisosEfectivos,
} from '../../../infraestructura/persistencia/consultador-permisos.typeorm';

@Injectable()
export class GuardiaPermisos implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(CONSULTADOR_PERMISOS_EFECTIVOS)
    private readonly consultador: ConsultadorPermisosEfectivos,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const permisosRequeridos = this.reflector.getAllAndOverride<string[]>(
      PERMISOS_REQUERIDOS,
      [contexto.getHandler(), contexto.getClass()],
    );
    if (!permisosRequeridos || permisosRequeridos.length === 0) {
      return true;
    }

    const request = contexto
      .switchToHttp()
      .getRequest<
        Request & { contextoActual?: ContextoSolicitudAutenticada }
      >();

    const ctx = request.contextoActual;
    if (!ctx || ctx.tipoToken !== 'ACCESO') {
      throw new ForbiddenException('PERMISO_DENEGADO');
    }
    if (ctx.ambito === null) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }

    const permisosEfectivos = await this.consultador.listar({
      usuarioId: ctx.usuarioId,
      rolId: ctx.rolId,
      institucionId: ctx.institucionId,
      sedeId: ctx.sedeId,
    });

    const tienePermisos = permisosRequeridos.every((p) =>
      permisosEfectivos.includes(p),
    );
    if (!tienePermisos) {
      throw new ForbiddenException('PERMISO_DENEGADO');
    }

    return true;
  }
}
