import type { BackendError } from '@/types/api';
import { MENSAJES_ERROR, MENSAJE_FALLBACK } from './codigos';
import { ApiError } from '@/lib/bff/cliente';

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

export function traducirBackendError(error: BackendError, statusHttp: number): ErrorApi {
  const mensajeUsuario = MENSAJES_ERROR[error.codigo] ?? MENSAJE_FALLBACK;
  return new ErrorApi(error.codigo, error.correlacionId, mensajeUsuario, statusHttp);
}

/** Convierte cualquier error (ApiError, ErrorApi, Error o desconocido) en texto para el usuario. */
export function traducirError(error: unknown): string {
  if (error instanceof ApiError) {
    return MENSAJES_ERROR[error.codigo] ?? MENSAJE_FALLBACK;
  }
  if (error instanceof ErrorApi) {
    return MENSAJES_ERROR[error.codigo] ?? error.mensajeUsuario ?? MENSAJE_FALLBACK;
  }
  if (error instanceof Error) {
    return error.message || MENSAJE_FALLBACK;
  }
  return MENSAJE_FALLBACK;
}

export function esSesionExpirada(error: unknown): boolean {
  return (
    (error instanceof ApiError && error.status === 401) ||
    (error instanceof ErrorApi && error.statusHttp === 401)
  );
}

export function esAccesoDenegado(error: unknown): boolean {
  return (
    (error instanceof ApiError && error.status === 403) ||
    (error instanceof ErrorApi && error.statusHttp === 403)
  );
}
