import type { NextRequest } from "next/server";

export interface AccesoResuelto {
  tipo: "PLATAFORMA" | "INSTITUCION";
  identificador: string | null;
  tipoIdentificador: "SUBDOMINIO_EDURA" | "RUTA_SLUG" | null;
}

export function resolverAccesoDesdeSolicitud(req: NextRequest): AccesoResuelto {
  const url = new URL(req.url);
  
  // 1. Verificar si es una ruta slug /acceso/[slug]
  if (url.pathname.startsWith("/acceso/")) {
    const partes = url.pathname.split("/");
    const slug = partes[2]; // /acceso/[slug] -> ['', 'acceso', 'slug']
    if (slug) {
      return {
        tipo: "INSTITUCION",
        identificador: slug,
        tipoIdentificador: "RUTA_SLUG",
      };
    }
  }

  // 2. Resolver host y subdominio
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const hostNormalizado = host.toLowerCase().trim();

  // Bloquear hosts de plataforma
  const platformHosts = [
    "plataforma.edura.pe",
    "plataforma.localhost:3001",
    "plataforma.localhost:3000",
  ];
  if (platformHosts.some((h) => hostNormalizado === h)) {
    return {
      tipo: "PLATAFORMA",
      identificador: null,
      tipoIdentificador: null,
    };
  }

  // Detectar subdominio
  // Si termina en edura.pe o localhost
  const dominioBase = process.env.EDURA_DOMINIO_BASE || "edura.pe";
  const partesHost = hostNormalizado.split(".");

  if (partesHost.length > 1) {
    const subdominio = partesHost[0];
    const palabrasReservadas = ["www", "api", "admin", "plataforma", "soporte", "correo", "static"];
    if (subdominio && !palabrasReservadas.includes(subdominio)) {
      // Validamos si el dominio base coincide
      const restoHost = partesHost.slice(1).join(".");
      if (restoHost.startsWith(dominioBase) || restoHost.startsWith("localhost")) {
        return {
          tipo: "INSTITUCION",
          identificador: subdominio,
          tipoIdentificador: "SUBDOMINIO_EDURA",
        };
      }
    }
  }

  // 3. Fallback por defecto si no es subdominio ni ruta slug
  return {
    tipo: "PLATAFORMA",
    identificador: null,
    tipoIdentificador: null,
  };
}
