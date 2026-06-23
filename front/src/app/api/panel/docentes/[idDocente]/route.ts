import { type NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idDocente: string }> }
): Promise<NextResponse> {
  const { idDocente } = await params;
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ codigo: 'CUERPO_INVALIDO', mensaje: 'Cuerpo inválido' }, { status: 400 });
  }

  let path = `/api/v1/docentes/${idDocente}`;
  if ('estado' in body) {
    path = `/api/v1/docentes/${idDocente}/estado`;
  }

  const resultado = await llamarAutenticado(
    sesion,
    path,
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
