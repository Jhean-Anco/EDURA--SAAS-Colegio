import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ContextoSolicitudAutenticada } from '../../../aplicacion/contexto-solicitud-autenticada';

export const ContextoActual = createParamDecorator(
  (
    _: unknown,
    ctx: ExecutionContext,
  ): ContextoSolicitudAutenticada | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<
        Request & { contextoActual?: ContextoSolicitudAutenticada }
      >();
    return request.contextoActual;
  },
);
