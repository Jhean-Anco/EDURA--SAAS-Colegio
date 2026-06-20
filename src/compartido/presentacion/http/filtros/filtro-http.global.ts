import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class FiltroHttpGlobal implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = String(request.headers['x-correlation-id'] ?? '');

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      let mensaje = 'Solicitud invalida.';
      if (typeof payload === 'string') {
        mensaje = payload;
      } else if (typeof payload === 'object' && payload !== null) {
        const contenido = payload as { message?: unknown };
        if (Array.isArray(contenido.message)) {
          mensaje = contenido.message.join(', ') || mensaje;
        } else if (typeof contenido.message === 'string') {
          mensaje = contenido.message;
        }
      }
      response.status(status).json({
        codigo: 'ERROR_HTTP',
        correlacionId: correlationId || undefined,
        mensaje,
        ruta: request.url,
        fecha: new Date().toISOString(),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      codigo: 'ERROR_INTERNO',
      correlacionId: correlationId || undefined,
      mensaje: 'Ocurrio un error inesperado.',
      ruta: request.url,
      fecha: new Date().toISOString(),
    });
    void exception;
  }
}
