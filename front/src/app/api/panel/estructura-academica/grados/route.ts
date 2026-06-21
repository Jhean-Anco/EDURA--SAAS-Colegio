import { type NextRequest, NextResponse } from 'next/server';
import { verificarSesion } from '@/lib/bff/guards';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';
import type { GradoEducativo } from '@/types/curriculo';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { sesion, error } = await verificarSesion();
  if (error) return error;

  const params = req.nextUrl.searchParams;
  const qs = params.toString() ? `?${params.toString()}` : '';

  const resultado = await llamarAutenticado<GradoEducativo[]>(
    sesion,
    `/api/v1/estructura-academica/grados${qs}`,
  );

  if (!resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: resultado.status });
}
