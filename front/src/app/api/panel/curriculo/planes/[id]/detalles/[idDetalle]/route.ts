import { type NextRequest, NextResponse } from 'next/server';
import { verificarSesionYCsrf } from '@/lib/bff/guards';
import { llamarAutenticado, errorResponse, errorBff } from '@/lib/bff/proxy';
import type { ActualizarDetalleSolicitud } from '@/types/curriculo';

interface Params {
  params: Promise<{ id: string; idDetalle: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id, idDetalle } = await params;
  const { sesion, error } = await verificarSesionYCsrf(req);
  if (error) return error;

  let body: ActualizarDetalleSolicitud;
  try {
    body = await req.json() as ActualizarDetalleSolicitud;
  } catch {
    return errorBff('ENTIDAD_NO_PROCESABLE', 'Cuerpo de solicitud inválido', 400);
  }

  const resultado = await llamarAutenticado<void>(
    sesion,
    `/api/v1/curriculo/planes/${id}/detalles/${idDetalle}`,
    { method: 'PATCH', body },
  );

  if (resultado.status !== 200 && resultado.status !== 204 && resultado.error) {
    return errorResponse(resultado.error, resultado.status);
  }

  return new NextResponse(null, { status: 204 });
}
