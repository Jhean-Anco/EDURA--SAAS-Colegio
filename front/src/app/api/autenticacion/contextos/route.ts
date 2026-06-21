import { NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { llamarBackend, renovarSesion, errorResponse } from '@/lib/bff/proxy';
import type { ContextoDescriptor } from '@/types/auth';

export async function GET(): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa' }, { status: 401 });
  }

  let resultado = await llamarBackend<ContextoDescriptor[]>(
    '/api/v1/autenticacion/contextos',
    { accessToken: sesion.accessToken },
  );

  if (resultado.status === 401) {
    const renovado = await renovarSesion(sesion);
    if (!renovado) {
      return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'Sesión expirada' }, { status: 401 });
    }
    resultado = await llamarBackend<ContextoDescriptor[]>(
      '/api/v1/autenticacion/contextos',
      { accessToken: sesion.accessToken },
    );
  }

  if (resultado.status !== 200 || !resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: 200 });
}
