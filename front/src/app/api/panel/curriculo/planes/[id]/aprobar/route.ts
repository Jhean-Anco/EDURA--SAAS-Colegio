import { type NextRequest, NextResponse } from 'next/server';
import { verificarSesionYCsrf } from '@/lib/bff/guards';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const { sesion, error } = await verificarSesionYCsrf(req);
  if (error) return error;

  const resultado = await llamarAutenticado<void>(
    sesion,
    `/api/v1/curriculo/planes/${id}/aprobar`,
    { method: 'POST' },
  );

  if (resultado.status !== 200 && resultado.status !== 204 && resultado.error) {
    return errorResponse(resultado.error, resultado.status);
  }

  return new NextResponse(null, { status: 204 });
}
