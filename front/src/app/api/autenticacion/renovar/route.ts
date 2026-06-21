import { NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { renovarSesion } from '@/lib/bff/proxy';

export async function POST(): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.refreshToken) {
    return NextResponse.json({ codigo: 'REFRESH_TOKEN_INVALIDO', mensaje: 'No hay refresh token' }, { status: 401 });
  }

  const renovado = await renovarSesion(sesion);
  if (!renovado) {
    return NextResponse.json({ codigo: 'REFRESH_TOKEN_INVALIDO', mensaje: 'No se pudo renovar la sesión' }, { status: 401 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
