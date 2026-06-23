import { type NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';

export async function GET(): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto || !sesion.contexto.institucionId) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa o institución en el contexto' }, { status: 401 });
  }

  const idInstitucion = sesion.contexto.institucionId;
  const resultado = await llamarAutenticado(
    sesion,
    `/api/v1/instituciones/${idInstitucion}`
  );

  if (resultado.status !== 200 || !resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: 200 });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto || !sesion.contexto.institucionId) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ codigo: 'CUERPO_INVALIDO', mensaje: 'Cuerpo inválido' }, { status: 400 });
  }

  const idInstitucion = sesion.contexto.institucionId;
  const resultado = await llamarAutenticado(
    sesion,
    `/api/v1/instituciones/${idInstitucion}`,
    {
      method: 'PATCH',
      body,
    }
  );

  if (resultado.status !== 200 && resultado.status !== 204) {
    return errorResponse(resultado.error, resultado.status);
  }

  return new NextResponse(null, { status: 204 });
}
