import type { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { errorBff } from './proxy';
import type { IronSession } from 'iron-session';
import type { EduraSession } from '@/types/auth';

export interface GuardResult {
  sesion: IronSession<EduraSession>;
  error?: NextResponse;
}

/** Verifica sesión activa. Para GET handlers. */
export async function verificarSesion(): Promise<GuardResult> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken) {
    return {
      sesion,
      error: errorBff('SESION_EXPIRADA', 'No hay sesión activa', 401),
    };
  }
  return { sesion };
}

/** Verifica sesión activa + token CSRF. Para mutaciones (POST/PATCH/DELETE). */
export async function verificarSesionYCsrf(req: NextRequest): Promise<GuardResult> {
  const { sesion, error } = await verificarSesion();
  if (error) return { sesion, error };

  const csrfHeader = req.headers.get('x-csrf-token');
  if (!sesion.csrfToken || csrfHeader !== sesion.csrfToken) {
    return {
      sesion,
      error: errorBff('ACCESO_DENEGADO', 'Token CSRF inválido', 403),
    };
  }

  return { sesion };
}
