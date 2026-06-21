'use client';

import type { BackendError } from '@/types/api';

export class ApiError extends Error {
  constructor(
    public readonly codigo: string,
    public readonly correlacionId: string,
    mensaje: string,
    public readonly ruta: string,
    public readonly fecha: string,
    public readonly status: number,
  ) {
    super(mensaje);
    this.name = 'ApiError';
  }
}

function leerCsrf(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/edura_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1] ?? '') : '';
}

async function manejarRespuesta<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(
      'ERROR_SERVIDOR',
      '',
      'Respuesta inesperada del servidor',
      res.url,
      new Date().toISOString(),
      res.status,
    );
  }

  if (!res.ok) {
    const err = json as Partial<BackendError>;
    throw new ApiError(
      err.codigo ?? 'ERROR_SERVIDOR',
      err.correlacionId ?? '',
      err.mensaje ?? 'Error inesperado',
      err.ruta ?? res.url,
      err.fecha ?? new Date().toISOString(),
      res.status,
    );
  }

  return json as T;
}

export interface OpcionesApi extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function apiFetch<T>(
  ruta: string,
  opciones: OpcionesApi = {},
  signal?: AbortSignal,
): Promise<T> {
  const { body, method = 'GET', ...resto } = opciones;

  const esMutacion = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(esMutacion ? { 'X-CSRF-Token': leerCsrf() } : {}),
    ...(resto.headers ?? {}),
  };

  const res = await fetch(ruta, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    credentials: 'same-origin',
    ...resto,
  });

  return manejarRespuesta<T>(res);
}
