import { type NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idEstudiante: string }> }
): Promise<NextResponse> {
  const { idEstudiante } = await params;
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ codigo: 'CUERPO_INVALIDO', mensaje: 'Cuerpo inválido' }, { status: 400 });
  }

  const resultado = await llamarAutenticado(
    sesion,
    `/api/v1/estudiantes/${idEstudiante}/apoderados`,
    {
      method: 'POST',
      body,
    }
  );

  if (resultado.status !== 201 && resultado.status !== 200) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: 201 });
}
