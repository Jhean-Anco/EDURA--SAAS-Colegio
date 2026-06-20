import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio';

@Catch()
export class FiltroErrorDominio implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      response.status(status).json({
        codigo: 'SOLICITUD_INVALIDA',
        mensaje:
          typeof payload === 'string' ? payload : 'La solicitud no es válida.',
        ruta: request.url,
        fecha: new Date().toISOString(),
      });
      return;
    }

    if (exception instanceof ErrorDominio) {
      const status = this.mapaEstado(exception.codigo);
      response.status(status).json({
        codigo: exception.codigo,
        mensaje: exception.message,
        detalles: exception.detalles ?? {},
        ruta: request.url,
        fecha: new Date().toISOString(),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      codigo: 'ERROR_INTERNO',
      mensaje: 'Ocurrió un error inesperado.',
      ruta: request.url,
      fecha: new Date().toISOString(),
    });
  }

  private mapaEstado(codigo: string): number {
    if (codigo.includes('NO_ENCONTRADO')) return HttpStatus.NOT_FOUND;
    if (codigo.includes('DUPLICADO') || codigo.includes('CONFLICTO')) {
      return HttpStatus.CONFLICT;
    }
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
