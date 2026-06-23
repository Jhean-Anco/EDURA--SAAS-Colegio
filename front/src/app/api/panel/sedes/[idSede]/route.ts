import { type NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idSede: string }> }
): Promise<NextResponse> {
  const { idSede } = await params;
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto || !sesion.contexto.institucionId) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ codigo: 'CUERPO_INVALIDO', mensaje: 'Cuerpo inválido' }, { status: 400 });
  }

  const idInstitucion = sesion.contexto.institucionId;
  const resultado = await llamarAutenticado(
    sesion,
    `/api/v1/instituciones/${idInstitucion}/sedes/${idSede}/estado`,
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idSede: string }> }
): Promise<NextResponse> {
  const { idSede } = await params;
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto || !sesion.contexto.institucionId) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa' }, { status: 401 });
  }

  const idInstitucion = sesion.contexto.institucionId;
  const resultado = await llamarAutenticado(
    sesion,
    `/api/v1/instituciones/${idInstitucion}/sedes/${idSede}/establecer-principal`,
    {
      method: 'POST',
    }
  );

  if (resultado.status !== 201 && resultado.status !== 200 && resultado.status !== 204) {
    return errorResponse(resultado.error, resultado.status);
  }

  return new NextResponse(null, { status: 204 });
}
