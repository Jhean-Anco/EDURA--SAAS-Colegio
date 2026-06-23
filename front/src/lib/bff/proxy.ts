import { NextResponse } from "next/server";
import type { EduraSession, ContextoDescriptor } from "@/types/auth";
import type { IronSession } from "iron-session";
import { esBackendError } from "@/types/api";
import { obtenerSesionServidor } from "@/lib/auth/sesion";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

let activeRefreshPromise: Promise<boolean> | null = null;

export interface ProxyOptions {
  method?: string;
  body?: unknown;
  accessToken?: string;
  signal?: AbortSignal;
}

export interface ProxyResult<T> {
  data?: T;
  status: number;
  error?: unknown;
}

export async function llamarBackend<T>(
  ruta: string,
  opciones: ProxyOptions = {},
): Promise<ProxyResult<T>> {
  const { method = "GET", body, accessToken, signal } = opciones;

  // Seguridad: Impedir que se llame a URLs externas o arbitrarias
  if (
    ruta.startsWith("http://") ||
    ruta.startsWith("https://") ||
    ruta.startsWith("//")
  ) {
    return {
      status: 400,
      error: {
        codigo: "ACCESO_DENEGADO",
        mensaje: "Dirección destino no permitida",
      },
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        status: 499,
        error: {
          codigo: "SOLICITUD_CANCELADA",
          mensaje: "Solicitud cancelada",
        },
      };
    }
    return {
      status: 503,
      error: {
        codigo: "ERROR_RED",
        mensaje: "No se pudo conectar con el servidor",
      },
    };
  }

  if (res.status === 204) {
    return { status: 204 };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return {
      status: res.status,
      error: {
        codigo: "ERROR_SERVIDOR",
        mensaje: "Respuesta inesperada del servidor",
      },
    };
  }

  if (!res.ok) {
    return { status: res.status, error: json };
  }

  return { status: res.status, data: json as T };
}

export function errorBff(
  codigo: string,
  mensaje: string,
  status: number,
  ruta = "",
): NextResponse {
  return NextResponse.json(
    {
      codigo,
      mensaje,
      correlacionId: "",
      ruta,
      fecha: new Date().toISOString(),
    },
    { status },
  );
}

export function errorResponse(error: unknown, status: number): NextResponse {
  if (esBackendError(error)) {
    return NextResponse.json(error, { status });
  }
  return NextResponse.json(
    {
      codigo: "ERROR_SERVIDOR",
      mensaje: "Error inesperado",
      correlacionId: "",
      ruta: "",
      fecha: new Date().toISOString(),
    },
    { status: 500 },
  );
}

export async function renovarSesion(
  sesion: IronSession<EduraSession>,
): Promise<boolean> {
  if (!sesion.refreshToken) return false;

  // Prevenir condiciones de carrera: Si ya hay una renovación activa, esperar por ella
  if (activeRefreshPromise) {
    try {
      const exito = await activeRefreshPromise;
      if (exito) {
        const nuevaSesion = await obtenerSesionServidor();
        sesion.accessToken = nuevaSesion.accessToken;
        sesion.refreshToken = nuevaSesion.refreshToken;
        sesion.contexto = nuevaSesion.contexto;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  activeRefreshPromise = (async () => {
    try {
      const resultado = await llamarBackend<{
        accessToken: string;
        refreshToken: string;
      }>("/api/v1/autenticacion/renovar", {
        method: "POST",
        body: { refreshToken: sesion.refreshToken },
      });

      if (resultado.status !== 200 || !resultado.data) {
        await sesion.destroy();
        return false;
      }

      sesion.accessToken = resultado.data.accessToken;
      sesion.refreshToken = resultado.data.refreshToken;

      if (sesion.contexto) {
        const reselect = await llamarBackend<{
          accessToken: string;
          contexto: Omit<ContextoDescriptor, "permisos">;
          permisos: string[];
        }>("/api/v1/autenticacion/seleccionar-contexto", {
          method: "POST",
          body: {
            ambito: sesion.contexto.ambito,
            rolId: sesion.contexto.rolId,
            rolCodigo: sesion.contexto.rolCodigo,
            institucionId: sesion.contexto.institucionId,
            sedeId: sesion.contexto.sedeId,
            institucionNombre: sesion.contexto.institucionNombre,
            sedeNombre: sesion.contexto.sedeNombre,
          },
          accessToken: resultado.data.accessToken,
        });

        if (reselect.status === 200 && reselect.data) {
          sesion.accessToken = reselect.data.accessToken;
          sesion.contexto = {
            ...reselect.data.contexto,
            permisos: reselect.data.permisos,
          } as ContextoDescriptor;
        } else {
          sesion.contexto = undefined;
        }
      }

      await sesion.save();
      return true;
    } catch {
      await sesion.destroy();
      return false;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}


/**
 * Ejecuta una llamada autenticada al backend con renovación automática de token.
 * Debe usarse desde route handlers BFF que ya tienen la sesión cargada.
 */
export async function llamarAutenticado<T>(
  sesion: IronSession<EduraSession>,
  ruta: string,
  opciones: Omit<ProxyOptions, "accessToken"> = {},
): Promise<ProxyResult<T>> {
  if (!sesion.accessToken) {
    return {
      status: 401,
      error: { codigo: "SESION_EXPIRADA", mensaje: "Sesión no válida" },
    };
  }

  let resultado = await llamarBackend<T>(ruta, {
    ...opciones,
    accessToken: sesion.accessToken,
  });

  if (resultado.status === 401) {
    const renovado = await renovarSesion(sesion);
    if (!renovado || !sesion.accessToken) {
      return {
        status: 401,
        error: { codigo: "SESION_EXPIRADA", mensaje: "Sesión expirada" },
      };
    }
    resultado = await llamarBackend<T>(ruta, {
      ...opciones,
      accessToken: sesion.accessToken,
    });
  }

  return resultado;
}
