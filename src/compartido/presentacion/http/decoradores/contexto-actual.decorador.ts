import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ContextoActual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{
      contextoActual?: unknown;
    }>();
    return request.contextoActual;
  },
);
