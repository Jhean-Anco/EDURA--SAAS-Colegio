import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { obtenerSesionServidor, generarCsrfToken, CSRF_COOKIE } from '@/lib/auth/sesion';
import { llamarBackend, errorResponse } from '@/lib/bff/proxy';
import type { ContextoDescriptor } from '@/types/auth';

interface CuerpoSeleccion {
  institucionId: string;
  ambito: 'INSTITUCION' | 'SEDE';
  sedeId?: string | null;
}

interface RespuestaSeleccion {
  accessToken: string;
  contexto: ContextoDescriptor;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa' }, { status: 401 });
  }

  const csrfHeader = req.headers.get('x-csrf-token');
  if (!sesion.csrfToken || csrfHeader !== sesion.csrfToken) {
    return NextResponse.json({ codigo: 'ACCESO_DENEGADO', mensaje: 'Token CSRF inválido' }, { status: 403 });
  }

  let body: CuerpoSeleccion;
  try {
    body = await req.json() as CuerpoSeleccion;
  } catch {
    return NextResponse.json({ codigo: 'ENTIDAD_NO_PROCESABLE', mensaje: 'Cuerpo inválido' }, { status: 400 });
  }

  const resultado = await llamarBackend<RespuestaSeleccion>(
    '/api/v1/autenticacion/seleccionar-contexto',
    { method: 'POST', body, accessToken: sesion.accessToken },
  );

  if (resultado.status !== 200 || !resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  const { accessToken, contexto } = resultado.data;
  const csrfToken = generarCsrfToken();

  sesion.accessToken = accessToken;
  sesion.contexto = contexto;
  sesion.csrfToken = csrfToken;
  await sesion.save();

  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
