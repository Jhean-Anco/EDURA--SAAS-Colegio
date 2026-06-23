import { type NextRequest, NextResponse } from "next/server";
import { resolverAccesoDesdeSolicitud } from "@/lib/auth/resolucion";
import { llamarBackend, errorResponse } from "@/lib/bff/proxy";

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Resolvemos el canal y el identificador basado en la URL/headers
  const resAcceso = resolverAccesoDesdeSolicitud(req);

  let tipoBackend = "PLATAFORMA";
  let identificadorBackend = "";

  // Si en la URL viene especificado por query (por ejemplo, para depuración/desarrollo local)
  const url = new URL(req.url);
  const queryTipo = url.searchParams.get("tipo");
  const queryIdentificador = url.searchParams.get("identificador");

  if (queryTipo && queryIdentificador) {
    tipoBackend = queryTipo;
    identificadorBackend = queryIdentificador;
  } else {
    tipoBackend = resAcceso.tipo === "PLATAFORMA" ? "PLATAFORMA" : (resAcceso.tipoIdentificador || "RUTA_SLUG");
    identificadorBackend = resAcceso.identificador || "";
  }

  const resultado = await llamarBackend<unknown>(
    `/api/v1/identidad-visual/publico/experiencia-acceso?tipo=${tipoBackend}&identificador=${identificadorBackend}`,
    { method: "GET" }
  );

  if (resultado.status !== 200 || !resultado.data) {
    return errorResponse(resultado.error, resultado.status);
  }

  // Devolvemos los datos del backend directamente
  return NextResponse.json(resultado.data, { status: 200 });
}
