import { type NextRequest, NextResponse } from "next/server";
import { obtenerSesionServidor } from "@/lib/auth/sesion";
import { llamarAutenticado } from "@/lib/bff/proxy";
import type { EduraSession } from "@/types/auth";
import type { IronSession } from "iron-session";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ path?: string[] }> }
): Promise<NextResponse> {
  const params = await props.params;
  const sesion = await obtenerSesionServidor();
  const subPath = params.path ? `/${params.path.join("/")}` : "";
  const url = new URL(req.url);
  const search = url.search;

  const resultado = await llamarAutenticado<unknown>(
    sesion,
    `/api/v1/identidad-visual${subPath}${search}`,
    { method: "GET" }
  );

  return NextResponse.json(resultado.data || resultado.error, { status: resultado.status });
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ path?: string[] }> }
): Promise<NextResponse> {
  const params = await props.params;
  const sesion = await obtenerSesionServidor();
  const subPath = params.path ? `/${params.path.join("/")}` : "";

  // Si es subida de activos, lo procesamos por separado para soportar multipart/form-data
  if (subPath === "/activos") {
    return subirActivos(req, sesion);
  }

  let body: unknown = undefined;
  try {
    body = await req.json();
  } catch {}

  const resultado = await llamarAutenticado<unknown>(
    sesion,
    `/api/v1/identidad-visual${subPath}`,
    { method: "POST", body }
  );

  return NextResponse.json(resultado.data || resultado.error, { status: resultado.status });
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ path?: string[] }> }
): Promise<NextResponse> {
  const params = await props.params;
  const sesion = await obtenerSesionServidor();
  const subPath = params.path ? `/${params.path.join("/")}` : "";

  let body: unknown = undefined;
  try {
    body = await req.json();
  } catch {}

  const resultado = await llamarAutenticado<unknown>(
    sesion,
    `/api/v1/identidad-visual${subPath}`,
    { method: "PATCH", body }
  );

  return NextResponse.json(resultado.data || resultado.error, { status: resultado.status });
}

// Helper para retransmitir multipart/form-data para activos
async function subirActivos(req: NextRequest, sesion: IronSession<EduraSession>): Promise<NextResponse> {
  if (!sesion.accessToken) {
    return NextResponse.json({ codigo: "SIN_AUTENTICACION" }, { status: 401 });
  }

  const formData = await req.formData();
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${backendUrl}/api/v1/identidad-visual/activos`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sesion.accessToken}`,
      },
      body: formData,
    });

    const json: unknown = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ codigo: "ERROR_SERVIDOR", mensaje: "Error al retransmitir archivo" }, { status: 500 });
  }
}
