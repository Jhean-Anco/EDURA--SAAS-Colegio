import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Observable, tap } from 'rxjs';
import { ContextoSolicitudAutenticada } from '../../../aplicacion/contexto-solicitud-autenticada';

@Injectable()
export class InterceptorSolicitudes implements NestInterceptor {
  private readonly logger = new Logger(InterceptorSolicitudes.name);

  intercept(
    contexto: ExecutionContext,
    siguiente: CallHandler,
  ): Observable<unknown> {
    const inicio = Date.now();
    const http = contexto.switchToHttp();
    const request = http.getRequest<
      Request & {
        contextoActual?: ContextoSolicitudAutenticada;
        correlationId?: string;
      }
    >();
    const response = http.getResponse<Response>();
    const correlationId = String(
      request.headers['x-correlation-id'] ?? randomUUID(),
    );
    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    return siguiente.handle().pipe(
      tap({
        next: () => {
          const ctx = request.contextoActual;
          this.logger.log(
            JSON.stringify({
              evento: 'SOLICITUD_COMPLETADA',
              metodo: request.method,
              ruta: request.url,
              codigoEstado: response.statusCode,
              duracionMs: Date.now() - inicio,
              correlationId,
              institucionId: ctx?.institucionId ?? null,
              sedeId: ctx?.sedeId ?? null,
              usuarioId: ctx?.usuarioId ?? null,
            }),
          );
        },
        error: () => {
          this.logger.error(
            JSON.stringify({
              evento: 'SOLICITUD_FALLIDA',
              metodo: request.method,
              ruta: request.url,
              duracionMs: Date.now() - inicio,
              correlationId,
            }),
          );
        },
      }),
    );
  }
}
