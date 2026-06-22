import type { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { errorBff } from './proxy';
import type { IronSession } from 'iron-session';
import type { EduraSession } from '@/types/auth';

export interface GuardResult {
  sesion: IronSession<EduraSession>;
  error?: NextResponse;
}

/** Valida que Origin y Referer (de estar presentes) correspondan al host actual */
export function validarOrigenYReferer(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host') || req.nextUrl.host;

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
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

/** Verifica sesión activa + token CSRF + Origin/Referer. Para mutaciones (POST/PATCH/DELETE). */
export async function verificarSesionYCsrf(req: NextRequest): Promise<GuardResult> {
  const { sesion, error } = await verificarSesion();
  if (error) return { sesion, error };

  if (!validarOrigenYReferer(req)) {
    return {
      sesion,
      error: errorBff('ACCESO_DENEGADO', 'Origen o Referer no autorizado', 403),
    };
  }

  const csrfHeader = req.headers.get('x-csrf-token');
  if (!sesion.csrfToken || csrfHeader !== sesion.csrfToken) {
    return {
      sesion,
      error: errorBff('ACCESO_DENEGADO', 'Token CSRF inválido', 403),
    };
  }

  return { sesion };
}

