import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  HttpException,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorDominio } from '../../../dominio/error-dominio';

@Catch()
export class FiltroHttpGlobal implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = String(request.headers['x-correlation-id'] ?? '');

    if (exception instanceof ErrorDominio) {
      const mapa: Record<string, HttpException> = {
        RECURSO_NO_ENCONTRADO: new NotFoundException(exception.message),
        CODIGO_DUPLICADO: new ConflictException(exception.message),
        CONTEXTO_NO_AUTORIZADO: new ForbiddenException(exception.message),
        REGLA_NEGOCIO_INVALIDA: new BadRequestException(exception.message),
        ESTADO_INCOMPATIBLE: new BadRequestException(exception.message),
        ENTIDAD_NO_PROCESABLE: new UnprocessableEntityException(
          exception.message,
        ),
      };
      const httpException =
        mapa[exception.codigo] ?? new BadRequestException(exception.message);
      const status = httpException.getStatus();
      const payload = httpException.getResponse();
      response.status(status).json({
        codigo: exception.codigo,
        correlacionId: correlationId || undefined,
        mensaje: (() => {
          if (
            typeof payload === 'object' &&
            payload !== null &&
            'message' in payload
          ) {
            const m = (payload as { message?: unknown }).message;
            if (typeof m === 'string') return m;
          }
          return exception.message;
        })(),
        ruta: request.url,
        fecha: new Date().toISOString(),
      });
      return;
    }

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
