import { type NextRequest, NextResponse } from 'next/server';
import { verificarSesion, verificarSesionYCsrf } from '@/lib/bff/guards';
import { llamarAutenticado, errorResponse, errorBff } from '@/lib/bff/proxy';
import type { PlanEstudio, ActualizarPlanSolicitud } from '@/types/curriculo';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const { sesion, error } = await verificarSesion();
  if (error) return error;

  const resultado = await llamarAutenticado<PlanEstudio>(
    sesion,
    `/api/v1/curriculo/planes/${id}`,
  );

  if (!resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: resultado.status });
}

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const { sesion, error } = await verificarSesionYCsrf(req);
  if (error) return error;

  let body: ActualizarPlanSolicitud;
  try {
    body = await req.json() as ActualizarPlanSolicitud;
  } catch {
    return errorBff('ENTIDAD_NO_PROCESABLE', 'Cuerpo de solicitud inválido', 400);
  }

  const resultado = await llamarAutenticado<void>(
    sesion,
    `/api/v1/curriculo/planes/${id}`,
    { method: 'PATCH', body },
  );

  if (resultado.status !== 200 && resultado.status !== 204 && resultado.error) {
    return errorResponse(resultado.error, resultado.status);
  }

  return new NextResponse(null, { status: 204 });
}
