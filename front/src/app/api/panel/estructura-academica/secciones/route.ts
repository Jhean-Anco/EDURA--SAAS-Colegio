import { type NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto || !sesion.contexto.sedeId) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'Sede no activa' }, { status: 401 });
  }

  const idSede = sesion.contexto.sedeId;
  const url = new URL(req.url);
  const idAnio = url.searchParams.get('idAnio') || '';
  const estado = url.searchParams.get('estado') || '';

  let path = `/api/v1/estructura-academica/ofertas?idSede=${idSede}`;
  if (idAnio) path += `&idAnio=${idAnio}`;
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
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'Sede no activa' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ codigo: 'CUERPO_INVALIDO', mensaje: 'Cuerpo inválido' }, { status: 400 });
  }

  // Forzar que la oferta se cree en la sede activa del contexto
  body.idSede = sesion.contexto.sedeId;

  const resultado = await llamarAutenticado(
    sesion,
    '/api/v1/estructura-academica/ofertas',
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
