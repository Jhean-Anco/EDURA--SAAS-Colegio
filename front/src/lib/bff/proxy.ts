import { NextResponse } from 'next/server';
import type { EduraSession } from '@/types/auth';
import type { IronSession } from 'iron-session';
import { esBackendError } from '@/types/api';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000';

export interface ProxyOptions {
  method?: string;
  body?: unknown;
  accessToken?: string;
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
  const { method = 'GET', body, accessToken } = opciones;

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
    });
  } catch {
    return { status: 503, error: { codigo: 'ERROR_RED', mensaje: 'No se pudo conectar con el servidor' } };
  }

  if (res.status === 204) {
    return { status: 204 };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { status: res.status, error: { codigo: 'ERROR_SERVIDOR', mensaje: 'Respuesta inesperada del servidor' } };
  }

  if (!res.ok) {
    return { status: res.status, error: json };
  }

  return { status: res.status, data: json as T };
}

export function errorResponse(error: unknown, status: number): NextResponse {
  if (esBackendError(error)) {
    return NextResponse.json(error, { status });
  }
  return NextResponse.json(
    { codigo: 'ERROR_SERVIDOR', mensaje: 'Error inesperado', correlacionId: '', ruta: '', fecha: new Date().toISOString() },
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

  // Si tiene contexto guardado, re-seleccionarlo automáticamente
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
