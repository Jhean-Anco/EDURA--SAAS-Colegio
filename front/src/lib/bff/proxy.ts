import { NextResponse } from 'next/server';
import type { EduraSession } from '@/types/auth';
import type { IronSession } from 'iron-session';
import { esBackendError } from '@/types/api';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000';

export interface ProxyOptions {
  method?: string;
  body?: unknown;
  accessToken?: string;
  signal?: AbortSignal;
}

export interface ProxyResult<T> {
  data?: T;
  status: number;
  error?: unknown;
}

export async function llamarBackend<T>(
  ruta: string,
  opciones: ProxyOptions = {},
): Promise<ProxyResult<T>> {
  const { method = 'GET', body, accessToken, signal } = opciones;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { status: 499, error: { codigo: 'SOLICITUD_CANCELADA', mensaje: 'Solicitud cancelada' } };
    }
    return {
      status: 503,
      error: { codigo: 'ERROR_RED', mensaje: 'No se pudo conectar con el servidor' },
    };
  }

  if (res.status === 204) {
    return { status: 204 };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return {
      status: res.status,
      error: { codigo: 'ERROR_SERVIDOR', mensaje: 'Respuesta inesperada del servidor' },
    };
  }

  if (!res.ok) {
    return { status: res.status, error: json };
  }

  return { status: res.status, data: json as T };
}

export function errorBff(
  codigo: string,
  mensaje: string,
  status: number,
  ruta = '',
): NextResponse {
  return NextResponse.json(
    {
      codigo,
      mensaje,
      correlacionId: '',
      ruta,
      fecha: new Date().toISOString(),
    },
    { status },
  );
}

export function errorResponse(error: unknown, status: number): NextResponse {
  if (esBackendError(error)) {
    return NextResponse.json(error, { status });
  }
  return NextResponse.json(
    {
      codigo: 'ERROR_SERVIDOR',
      mensaje: 'Error inesperado',
      correlacionId: '',
      ruta: '',
      fecha: new Date().toISOString(),
    },
    { status: 500 },
  );
}

export async function renovarSesion(
  sesion: IronSession<EduraSession>,
): Promise<boolean> {
  if (!sesion.refreshToken) return false;

  const resultado = await llamarBackend<{ accessToken: string; refreshToken: string }>(
    '/api/v1/autenticacion/renovar',
    {
      method: 'POST',
      body: { refreshToken: sesion.refreshToken },
    },
  );

  if (resultado.status !== 200 || !resultado.data) {
    await sesion.destroy();
    return false;
  }

  sesion.accessToken = resultado.data.accessToken;
  sesion.refreshToken = resultado.data.refreshToken;

  if (sesion.contexto) {
    const reselect = await llamarBackend<{ accessToken: string }>(
      '/api/v1/autenticacion/seleccionar-contexto',
      {
        method: 'POST',
        body: {
          institucionId: sesion.contexto.institucionId,
          ambito: sesion.contexto.ambito,
          sedeId: sesion.contexto.sedeId,
        },
        accessToken: resultado.data.accessToken,
      },
    );

    if (reselect.status === 200 && reselect.data) {
      sesion.accessToken = reselect.data.accessToken;
    } else {
      sesion.contexto = undefined;
    }
  }

  await sesion.save();
  return true;
}

/**
 * Ejecuta una llamada autenticada al backend con renovación automática de token.
 * Debe usarse desde route handlers BFF que ya tienen la sesión cargada.
 */
export async function llamarAutenticado<T>(
  sesion: IronSession<EduraSession>,
  ruta: string,
  opciones: Omit<ProxyOptions, 'accessToken'> = {},
): Promise<ProxyResult<T>> {
  if (!sesion.accessToken) {
    return { status: 401, error: { codigo: 'SESION_EXPIRADA', mensaje: 'Sesión no válida' } };
  }

  let resultado = await llamarBackend<T>(ruta, { ...opciones, accessToken: sesion.accessToken });

  if (resultado.status === 401) {
    const renovado = await renovarSesion(sesion);
    if (!renovado || !sesion.accessToken) {
      return { status: 401, error: { codigo: 'SESION_EXPIRADA', mensaje: 'Sesión expirada' } };
    }
    resultado = await llamarBackend<T>(ruta, { ...opciones, accessToken: sesion.accessToken });
  }

  return resultado;
}
