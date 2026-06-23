import { type NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';

export async function GET(): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto || !sesion.contexto.sedeId) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'Sede no activa en el contexto' }, { status: 401 });
  }

  const idSede = sesion.contexto.sedeId;

  // Realizamos las llamadas al backend en paralelo
  const [elementosRes, serviciosRes] = await Promise.all([
    llamarAutenticado(sesion, `/api/v1/sedes/${idSede}/infraestructura/elementos`),
    llamarAutenticado(sesion, `/api/v1/sedes/${idSede}/servicios-basicos`),
  ]);

  if (elementosRes.status !== 200) {
    return errorResponse(elementosRes.error, elementosRes.status);
  }

  const datosElementos = elementosRes.data && typeof elementosRes.data === 'object' && 'datos' in elementosRes.data
    ? (elementosRes.data as { datos: unknown[] }).datos
    : [];

  return NextResponse.json({
    elementos: datosElementos,
    servicios: serviciosRes.status === 200 ? serviciosRes.data : [],
  }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto || !sesion.contexto.sedeId) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'Sede no activa' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ codigo: 'CUERPO_INVALIDO', mensaje: 'Cuerpo inválido' }, { status: 400 });
  }

  const idSede = sesion.contexto.sedeId;
  const resultado = await llamarAutenticado(
    sesion,
    `/api/v1/sedes/${idSede}/servicios-basicos`,
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
