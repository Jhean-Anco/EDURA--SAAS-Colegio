import { type NextRequest, NextResponse } from 'next/server';
import { verificarSesionYCsrf } from '@/lib/bff/guards';
import { llamarAutenticado, errorResponse, errorBff } from '@/lib/bff/proxy';
import type { DuplicarPlanSolicitud } from '@/types/curriculo';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const { sesion, error } = await verificarSesionYCsrf(req);
  if (error) return error;

  let body: DuplicarPlanSolicitud;
  try {
    body = await req.json() as DuplicarPlanSolicitud;
  } catch {
    return errorBff('ENTIDAD_NO_PROCESABLE', 'Cuerpo de solicitud inválido', 400);
  }

  const resultado = await llamarAutenticado<{ id: string }>(
    sesion,
    `/api/v1/curriculo/planes/${id}/duplicar`,
    { method: 'POST', body },
  );

  if (!resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: 201 });
}
