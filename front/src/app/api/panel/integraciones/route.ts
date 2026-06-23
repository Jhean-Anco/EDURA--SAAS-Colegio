import { type NextRequest, NextResponse } from 'next/server';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { llamarAutenticado, errorResponse } from '@/lib/bff/proxy';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    return NextResponse.json({ codigo: 'SESION_EXPIRADA', mensaje: 'No hay sesión activa' }, { status: 401 });
  }

  const url = new URL(req.url);
  const tipo = url.searchParams.get('tipo'); // 'dni' o 'ruc'

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ codigo: 'CUERPO_INVALIDO', mensaje: 'Cuerpo inválido' }, { status: 400 });
  }

  let path = '';
  if (tipo === 'dni') {
    path = '/api/v1/personas/consultas/dni';
  } else if (tipo === 'ruc') {
    path = '/api/v1/integraciones/documentos/consultas/ruc';
  } else {
    return NextResponse.json({ codigo: 'TIPO_INVALIDO', mensaje: 'Tipo de consulta no soportado' }, { status: 400 });
  }

  const resultado = await llamarAutenticado(
    sesion,
    path,
    {
      method: 'POST',
      body,
    }
  );

  if (resultado.status !== 200 && resultado.status !== 201) {
    return errorResponse(resultado.error, resultado.status);
  }

  return NextResponse.json(resultado.data, { status: 200 });
}
