import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { obtenerSesionServidor, generarCsrfToken, CSRF_COOKIE } from '@/lib/auth/sesion';
import { llamarBackend, errorResponse } from '@/lib/bff/proxy';
import { verificarSesionYCsrf } from '@/lib/bff/guards';
import type { ContextoDescriptor } from '@/types/auth';

interface CuerpoSeleccion {
  ambito: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';
  rolId: string;
  rolCodigo: string;
  institucionId: string | null;
  sedeId: string | null;
  institucionNombre: string | null;
  sedeNombre: string | null;
}

interface RespuestaSeleccion {
  accessToken: string;
  contexto: {
    ambito: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';
    rolId: string;
    rolCodigo: string;
    institucionId: string | null;
    institucionNombre: string | null;
    sedeId: string | null;
    sedeNombre: string | null;
  };
  permisos: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { sesion, error } = await verificarSesionYCsrf(req);
  if (error) return error;

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

  const { accessToken, contexto, permisos } = resultado.data;
  const csrfToken = generarCsrfToken();

  sesion.accessToken = accessToken;
  sesion.contexto = {
    ...contexto,
    permisos,
  };
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

