import type { BackendError } from '@/types/api';
import { MENSAJES_ERROR, MENSAJE_FALLBACK } from './codigos';

export class ErrorApi extends Error {
  readonly codigo: string;
  readonly correlacionId: string;
  readonly mensajeUsuario: string;
  readonly statusHttp: number;

  constructor(
    codigo: string,
    correlacionId: string,
    mensajeUsuario: string,
    statusHttp: number,
  ) {
    super(mensajeUsuario);
    this.name = 'ErrorApi';
    this.codigo = codigo;
    this.correlacionId = correlacionId;
    this.mensajeUsuario = mensajeUsuario;
    this.statusHttp = statusHttp;
  }
}

export function traducirError(error: BackendError, statusHttp: number): ErrorApi {
  const mensajeUsuario = MENSAJES_ERROR[error.codigo] ?? MENSAJE_FALLBACK;
  return new ErrorApi(error.codigo, error.correlacionId, mensajeUsuario, statusHttp);
}

export function esSesionExpirada(error: unknown): boolean {
  return error instanceof ErrorApi && error.statusHttp === 401;
}

export function esAccesoDenegado(error: unknown): boolean {
  return error instanceof ErrorApi && error.statusHttp === 403;
}
