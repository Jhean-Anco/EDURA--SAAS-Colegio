import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/autenticacion/iniciar-sesion", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    if (body.email === "admin@edura.pe" && body.password === "password123") {
      return HttpResponse.json({ ok: true }, { status: 200 });
    }
    return HttpResponse.json(
      {
        codigo: "CREDENCIALES_INVALIDAS",
        correlacionId: "test-001",
        mensaje: "Credenciales incorrectas",
        ruta: "/api/v1/autenticacion/iniciar-sesion",
        fecha: new Date().toISOString(),
      },
      { status: 401 },
    );
  }),

  http.get("/api/autenticacion/contextos", () => {
    return HttpResponse.json([
      {
        institucionId: "inst-001",
        nombreInstitucion: "I.E. San Pedro",
        ambito: "INSTITUCION",
        sedeId: null,
        nombreSede: null,
        permisos: ["PANEL_INSTITUCIONAL.RESUMEN.LEER"],
        roles: ["DIRECTIVO"],
      },
      {
        institucionId: "inst-001",
        nombreInstitucion: "I.E. San Pedro",
        ambito: "SEDE",
        sedeId: "sede-001",
        nombreSede: "Sede Principal",
        permisos: ["PANEL_INSTITUCIONAL.RESUMEN.LEER"],
        roles: ["DOCENTE"],
      },
    ]);
  }),

  http.post("/api/autenticacion/seleccionar-contexto", () => {
    return HttpResponse.json({ ok: true }, { status: 200 });
  }),
];
