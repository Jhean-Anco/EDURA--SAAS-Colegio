import { headers } from "next/headers";
import { resolverAccesoDesdeSolicitud } from "./resolucion";
import type { NextRequest } from "next/server";

export interface ExperienciaAccesoResultado {
  tipoAcceso: "PLATAFORMA" | "INSTITUCION";
  identificador?: string | null;
  institucion?: {
    nombreMarca: string;
    nombreShort: string;
  };
  identidadVisual?: {
    version: number;
    nombreMarca: string;
    lema: string | null;
    tituloLogin: string;
    mensajeLogin: string;
    textoPieLogin: string;
    colorPrimario: string;
    colorSobrePrimario: string;
    colorSecundario: string;
    colorAcento: string;
    colorFondo: string;
    colorSuperficie: string;
    colorTextoPrincipal: string;
    colorTextoSecundario: string;
    logoPrincipalUrl: string | null;
    faviconUrl: string | null;
    fondoLoginUrl: string | null;
  };
}

export async function obtenerExperienciaAccesoServidor(): Promise<ExperienciaAccesoResultado> {
  const headersList = await headers();
  
  const host = headersList.get("host") || "localhost:3001";
  const referer = headersList.get("referer") || "";
  
  let urlActual = `http://${host}`;
  if (referer && referer.includes(host)) {
    urlActual = referer;
  }

  // Simulamos un NextRequest mínimo
  const mockReq = {
    url: urlActual,
    headers: {
      get: (name: string) => headersList.get(name),
    },
  } as unknown as NextRequest;

  const resAcceso = resolverAccesoDesdeSolicitud(mockReq);

  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  const tipoBackend = resAcceso.tipo === "PLATAFORMA" ? "PLATAFORMA" : (resAcceso.tipoIdentificador || "RUTA_SLUG");
  const identificadorBackend = resAcceso.identificador || "";

  try {
    const res = await fetch(
      `${backendUrl}/api/v1/identidad-visual/publico/experiencia-acceso?tipo=${tipoBackend}&identificador=${identificadorBackend}`,
      {
        next: { revalidate: 60 }, // Cacheamos por 60 segundos
      }
    );
    if (!res.ok) {
      throw new Error("Error al consultar backend");
    }
    return res.json();
  } catch {
    // Fallback neutral
    return {
      tipoAcceso: "PLATAFORMA",
      identidadVisual: {
        version: 0,
        nombreMarca: "EDURA",
        lema: "Plataforma Educativa",
        tituloLogin: "Iniciar sesión",
        mensajeLogin: "Ingresa tus credenciales para acceder.",
        textoPieLogin: "Tecnología provista por EDURA",
        colorPrimario: "#1E3A8A",
        colorSobrePrimario: "#FFFFFF",
        colorSecundario: "#D8A72D",
        colorAcento: "#3B82F6",
        colorFondo: "#F8FAFC",
        colorSuperficie: "#FFFFFF",
        colorTextoPrincipal: "#172033",
        colorTextoSecundario: "#536078",
        logoPrincipalUrl: null,
        faviconUrl: null,
        fondoLoginUrl: null,
      },
    };
  }
}
