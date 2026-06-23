export interface VersionVisual {
  id: string;
  idIdentidadVisual: string;
  numeroVersion: number;
  estado: "BORRADOR" | "PUBLICADA" | "ARCHIVADA";
  nombreMarca: string;
  nombreCortoVisual: string | null;
  lema: string | null;
  tituloLogin: string | null;
  mensajeLogin: string | null;
  textoPieLogin: string | null;
  colorPrimario: string;
  colorSobrePrimario: string;
  colorSecundario: string;
  colorAcento: string;
  colorFondo: string;
  colorSuperficie: string;
  colorTextoPrincipal: string;
  colorTextoSecundario: string;
  varianteLogin: string;
  activos: ActivoVisual[];
}

export interface ActivoVisual {
  id: string;
  tipo: "LOGO_PRINCIPAL" | "LOGO_HORIZONTAL" | "LOGO_FONDO_CLARO" | "LOGO_FONDO_OSCURO" | "ISOTIPO" | "FAVICON" | "FONDO_LOGIN" | "IMAGEN_PORTADA";
  claveAlmacenamiento: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: string;
  textoAlternativo: string;
  estado: "ACTIVO" | "ARCHIVADO";
}

export interface PuntoAcceso {
  id: string;
  tipo: "SUBDOMINIO_EDURA" | "RUTA_SLUG" | "CODIGO_ACCESO" | "DOMINIO_PERSONALIZADO";
  valor: string;
  valorNormalizado: string;
  esPrincipal: boolean;
  estado: "PENDIENTE" | "ACTIVO" | "SUSPENDIDO" | "RECHAZADO";
}

export async function obtenerBorrador(): Promise<VersionVisual> {
  const res = await fetch("/api/identidad-visual/borrador");
  if (!res.ok) throw new Error("Error al obtener borrador");
  return res.json();
}

export async function guardarBorrador(datos: Partial<VersionVisual>): Promise<VersionVisual> {
  const res = await fetch("/api/identidad-visual/borrador", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("Error al guardar borrador");
  return res.json();
}

export async function publicarIdentidad(): Promise<{ ok: boolean; versionPublicada: number }> {
  const res = await fetch("/api/identidad-visual/publicar", {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.mensaje || "Error al publicar");
  }
  return res.json();
}

export async function cargarActivo(tipo: string, archivo: File, textoAlternativo: string): Promise<unknown> {
  const formData = new FormData();
  formData.append("tipo", tipo);
  formData.append("archivo", archivo);
  formData.append("textoAlternativo", textoAlternativo);

  const res = await fetch("/api/identidad-visual/activos", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al cargar activo");
  return res.json();
}

export async function archivarActivo(id: string): Promise<void> {
  const res = await fetch(`/api/identidad-visual/activos/${id}/archivar`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Error al archivar activo");
}

export async function obtenerPuntosAcceso(): Promise<PuntoAcceso[]> {
  const res = await fetch("/api/identidad-visual/puntos-acceso");
  if (!res.ok) throw new Error("Error al obtener puntos de acceso");
  return res.json();
}

export async function crearPuntoAcceso(datos: Omit<PuntoAcceso, "id" | "valorNormalizado" | "estado">): Promise<PuntoAcceso> {
  const res = await fetch("/api/identidad-visual/puntos-acceso", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.mensaje || "Error al crear punto de acceso");
  }
  return res.json();
}

export async function suspenderPuntoAcceso(id: string): Promise<void> {
  const res = await fetch(`/api/identidad-visual/puntos-acceso/${id}/suspender`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error al suspender punto de acceso");
}
