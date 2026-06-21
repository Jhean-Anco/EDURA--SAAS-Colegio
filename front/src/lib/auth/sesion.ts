import { getIronSession } from 'iron-session';
import type { IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { EduraSession } from '@/types/auth';

const SESSION_SECRET = process.env.SESSION_SECRET;
const SESSION_COOKIE = 'edura_session';
export const CSRF_COOKIE = 'edura_csrf';

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET debe tener al menos 32 caracteres');
}

export const sessionOptions = {
  password: SESSION_SECRET,
  cookieName: SESSION_COOKIE,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  },
};

export async function obtenerSesionServidor(): Promise<IronSession<EduraSession>> {
  const cookieStore = await cookies();
  return getIronSession<EduraSession>(cookieStore, sessionOptions);
}

export function generarCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
