import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { obtenerSesionServidor, CSRF_COOKIE } from "@/lib/auth/sesion";
import { llamarBackend } from "@/lib/bff/proxy";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sesion = await obtenerSesionServidor();

  if (sesion.accessToken) {
    const csrfHeader = req.headers.get("x-csrf-token");
    if (sesion.csrfToken && csrfHeader !== sesion.csrfToken) {
      return NextResponse.json(
        { codigo: "ACCESO_DENEGADO", mensaje: "Token CSRF inválido" },
        { status: 403 },
      );
    }

    await llamarBackend("/api/v1/autenticacion/cerrar-sesion", {
      method: "POST",
      accessToken: sesion.accessToken,
    }).catch(() => null);
  }

  await sesion.destroy();

  const cookieStore = await cookies();
  cookieStore.delete(CSRF_COOKIE);

  return NextResponse.json({ ok: true }, { status: 200 });
}
