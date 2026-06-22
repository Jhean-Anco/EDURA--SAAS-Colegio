import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  obtenerSesionServidor,
  generarCsrfToken,
  CSRF_COOKIE,
} from "@/lib/auth/sesion";
import { llamarBackend, errorResponse } from "@/lib/bff/proxy";
import { validarOrigenYReferer } from "@/lib/bff/guards";

interface RespuestaLogin {
  usuarioId: string;
  nombreMostrado: string;
  correo: string;
  requiereCambioClave: boolean;
  accessToken: string;
  refreshToken: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!validarOrigenYReferer(req)) {
    return NextResponse.json(
      { codigo: "ACCESO_DENEGADO", mensaje: "Origen o Referer no autorizado" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { codigo: "ENTIDAD_NO_PROCESABLE", mensaje: "Cuerpo inválido" },
      { status: 400 },
    );
  }

  const resultado = await llamarBackend<RespuestaLogin>(
    "/api/v1/autenticacion/iniciar-sesion",
    { method: "POST", body },
  );

  if (resultado.status !== 200 || !resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  const {
    accessToken,
    refreshToken,
    nombreMostrado,
    correo,
    usuarioId,
    requiereCambioClave,
  } = resultado.data;

  const sesion = await obtenerSesionServidor();
  await sesion.destroy();

  const csrfToken = generarCsrfToken();
  sesion.accessToken = accessToken;
  sesion.refreshToken = refreshToken;
  sesion.nombreCompleto = nombreMostrado;
  sesion.email = correo;
  sesion.usuarioId = usuarioId;
  sesion.requiereCambioClave = requiereCambioClave;
  sesion.csrfToken = csrfToken;
  await sesion.save();

  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true, requiereCambioClave }, { status: 200 });
}

