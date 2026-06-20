import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
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

    if (exception instanceof QueryFailedError) {
      const codigo = this.obtenerCodigoPostgres(exception);
      const status = this.mapaEstadoPostgres(codigo);
      response.status(status).json({
        codigo: codigo ?? 'ERROR_PERSISTENCIA',
        mensaje: this.mensajePostgres(codigo),
        detalles: {},
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

  private obtenerCodigoPostgres(exception: unknown): string | null {
    const error = exception as { code?: string };
    return error.code ?? null;
  }

  private mapaEstadoPostgres(codigo: string | null): number {
    switch (codigo) {
      case '23505':
      case '23503':
      case '40001':
      case '40P01':
        return HttpStatus.CONFLICT;
      case '23514':
        return HttpStatus.UNPROCESSABLE_ENTITY;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private mensajePostgres(codigo: string | null): string {
    switch (codigo) {
      case '23505':
        return 'Ya existe un registro con esos datos.';
      case '23503':
        return 'La referencia solicitada no existe o no es valida.';
      case '23514':
        return 'La regla de integridad no se cumple.';
      case '40001':
        return 'La operacion no pudo completarse por concurrencia.';
      case '40P01':
        return 'La operacion no pudo completarse por bloqueo.';
      default:
        return 'Ocurrio un error de persistencia.';
    }
  }
}
