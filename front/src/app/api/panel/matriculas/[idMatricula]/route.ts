import { type NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idMatricula: string }> }
): Promise<NextResponse> {
  const { idMatricula } = await params;
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa' }, { status: 401 });
  }

  const url = new URL(req.url);
  const accion = url.searchParams.get('accion'); // 'activar', 'anular', 'retirar'

  let body = {};
  if (accion === 'anular' || accion === 'retirar') {
    try {
      body = await req.json();
    } catch {
      // Ignorar si no hay cuerpo para estas acciones
    }
  }

  let path = `/api/v1/matriculas/${idMatricula}/activar`;
  if (accion === 'anular') path = `/api/v1/matriculas/${idMatricula}/anular`;
  if (accion === 'retirar') path = `/api/v1/matriculas/${idMatricula}/retirar`;

  const resultado = await llamarAutenticado(
    sesion,
    path,
    {
      method: 'POST',
      body,
    }
  );

  if (resultado.status !== 200 && resultado.status !== 201 && resultado.status !== 204) {
    return errorResponse(resultado.error, resultado.status);
  }

  return new NextResponse(null, { status: 204 });
}
