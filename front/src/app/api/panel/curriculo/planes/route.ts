import { type NextRequest, NextResponse } from 'next/server';
import { verificarSesion, verificarSesionYCsrf } from '@/lib/bff/guards';
import { llamarAutenticado, errorResponse, errorBff } from '@/lib/bff/proxy';
import type { PlanEstudioItem, CrearPlanSolicitud } from '@/types/curriculo';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { sesion, error } = await verificarSesion();
  if (error) return error;

  const params = req.nextUrl.searchParams;
  const qs = params.toString() ? `?${params.toString()}` : '';

  const resultado = await llamarAutenticado<PlanEstudioItem[]>(
    sesion,
    `/api/v1/curriculo/planes${qs}`,
  );

  if (!resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: resultado.status });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { sesion, error } = await verificarSesionYCsrf(req);
  if (error) return error;

  let body: CrearPlanSolicitud;
  try {
    body = await req.json() as CrearPlanSolicitud;
  } catch {
    return errorBff('ENTIDAD_NO_PROCESABLE', 'Cuerpo de solicitud inválido', 400);
  }

  const resultado = await llamarAutenticado<{ id: string }>(
    sesion,
    '/api/v1/curriculo/planes',
    { method: 'POST', body },
  );

  if (!resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: 201 });
}
