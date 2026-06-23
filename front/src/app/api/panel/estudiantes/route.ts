import { type NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa' }, { status: 401 });
  }

  const url = new URL(req.url);
  const busqueda = url.searchParams.get('busqueda') || '';
  const estado = url.searchParams.get('estado') || '';
  const pagina = url.searchParams.get('pagina') || '1';
  const limite = url.searchParams.get('limite') || '20';

  let path = `/api/v1/estudiantes?pagina=${pagina}&limite=${limite}`;
  if (busqueda) path += `&busqueda=${encodeURIComponent(busqueda)}`;
  if (estado) path += `&estado=${estado}`;

  const resultado = await llamarAutenticado(sesion, path);

  if (resultado.status !== 200 || !resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto || !sesion.contexto.sedeId) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'Sede no activa en el contexto' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ codigo: 'CUERPO_INVALIDO', mensaje: 'Cuerpo inválido' }, { status: 400 });
  }

  // Asegurar que el estudiante se registra en la sede actual
  body.idSede = sesion.contexto.sedeId;

  const resultado = await llamarAutenticado(
    sesion,
    '/api/v1/estudiantes',
    {
      method: 'POST',
      body,
    }
  );

  if (resultado.status !== 201 || !resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: 201 });
}
