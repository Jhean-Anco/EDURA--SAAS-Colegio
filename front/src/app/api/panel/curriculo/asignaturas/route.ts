import { type NextRequest, NextResponse } from 'next/server';
import { verificarSesion } from '@/lib/bff/guards';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';
import type { Asignatura } from '@/types/curriculo';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { sesion, error } = await verificarSesion();
  if (error) return error;

  const params = req.nextUrl.searchParams;
  const qs = params.toString() ? `?${params.toString()}` : '';

  const resultado = await llamarAutenticado<Asignatura[]>(
    sesion,
    `/api/v1/curriculo/asignaturas${qs}`,
  );

  if (!resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: resultado.status });
}
