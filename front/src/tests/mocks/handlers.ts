import { http, HttpResponse } from 'msw';

// ── Autenticación ──────────────────────────────────────────────────────────

export const handlers = [
  http.post('/api/autenticacion/iniciar-sesion', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email === 'admin@edura.pe' && body.password === 'password123') {
      return HttpResponse.json({ ok: true }, { status: 200 });
    }
    return HttpResponse.json(
      {
        codigo: 'CREDENCIALES_INVALIDAS',
        correlacionId: 'test-001',
        mensaje: 'Credenciales incorrectas',
        ruta: '/api/v1/autenticacion/iniciar-sesion',
        fecha: new Date().toISOString(),
      },
      { status: 401 },
    );
  }),

  http.get('/api/autenticacion/contextos', () => {
    return HttpResponse.json([
      {
        institucionId: 'inst-001',
        nombreInstitucion: 'I.E. San Pedro',
        ambito: 'INSTITUCION',
        sedeId: null,
        nombreSede: null,
        permisos: [
          'PANEL_INSTITUCIONAL.RESUMEN.LEER',
          'CURRICULO.LEER',
          'CURRICULO.PLANES.GESTIONAR',
          'CURRICULO.PLANES.APROBAR',
          'CURRICULO.PLANES.CAMBIAR_ESTADO',
        ],
        roles: ['DIRECTIVO'],
      },
      {
        institucionId: 'inst-001',
        nombreInstitucion: 'I.E. San Pedro',
        ambito: 'SEDE',
        sedeId: 'sede-001',
        nombreSede: 'Sede Principal',
        permisos: [
          'PANEL_INSTITUCIONAL.RESUMEN.LEER',
          'CURRICULO.LEER',
        ],
        roles: ['DOCENTE'],
      },
    ]);
  }),

  http.post('/api/autenticacion/seleccionar-contexto', () => {
    return HttpResponse.json({ ok: true }, { status: 200 });
  }),

  http.post('/api/autenticacion/cerrar-sesion', () => {
    return HttpResponse.json({ ok: true }, { status: 200 });
  }),

  // ── Estructura académica ────────────────────────────────────────────────

  http.get('/api/panel/estructura-academica/anios', () => {
    return HttpResponse.json([
      {
        id: 'anio-2025',
        anio: 2025,
        codigo: '2025',
        nombre: 'Año académico 2025',
        fechaInicio: '2025-03-01',
        fechaFin: '2025-12-15',
        estado: 'ACTIVO',
      },
    ]);
  }),

  http.get('/api/panel/estructura-academica/grados', () => {
    return HttpResponse.json([
      {
        id: 'grado-1pri',
        codigo: '1PRI',
        nombre: '1er Grado',
        orden: 1,
        estado: 'ACTIVO',
        idNivelEducativo: 'niv-pri',
        nombreNivel: 'Primaria',
      },
    ]);
  }),

  // ── Currículo ───────────────────────────────────────────────────────────

  http.get('/api/panel/curriculo/asignaturas', () => {
    return HttpResponse.json([
      {
        id: 'asig-matematica',
        idAreaCurricular: 'area-mat',
        nombreArea: 'Matemática',
        codigo: 'MAT',
        nombre: 'Matemática',
        nombreCorto: 'Mat',
        descripcion: null,
        orden: 1,
        estado: 'ACTIVA',
      },
    ]);
  }),

  http.get('/api/panel/curriculo/planes', () => {
    return HttpResponse.json([
      {
        id: 'plan-001',
        codigo: 'PE-2025-1PRI',
        nombre: 'Plan de estudios 1er grado 2025',
        version: 1,
        estado: 'BORRADOR',
        idAnioAcademico: 'anio-2025',
        anio: 2025,
        idGradoEducativo: 'grado-1pri',
        nombreGrado: '1er Grado',
        nombreNivel: 'Primaria',
      },
    ]);
  }),

  http.get('/api/panel/curriculo/planes/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      codigo: 'PE-2025-1PRI',
      nombre: 'Plan de estudios 1er grado 2025',
      version: 1,
      estado: 'BORRADOR',
      idAnioAcademico: 'anio-2025',
      anio: 2025,
      idGradoEducativo: 'grado-1pri',
      nombreGrado: '1er Grado',
      nombreNivel: 'Primaria',
      observacion: null,
      fechaAprobacion: null,
      idUsuarioAprobador: null,
      totalAsignaturasActivas: 0,
      totalHorasSemanales: 0,
      totalHorasAnuales: 0,
      detalles: [],
    });
  }),

  http.post('/api/panel/curriculo/planes', () => {
    return HttpResponse.json({ id: 'plan-nuevo-001' }, { status: 201 });
  }),

  http.patch('/api/panel/curriculo/planes/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/panel/curriculo/planes/:id/aprobar', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('/api/panel/curriculo/planes/:id/estado', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/panel/curriculo/planes/:id/duplicar', () => {
    return HttpResponse.json({ id: 'plan-duplicado-001' }, { status: 201 });
  }),

  http.get('/api/panel/curriculo/planes/:id/detalles', () => {
    return HttpResponse.json([]);
  }),

  http.post('/api/panel/curriculo/planes/:id/detalles', () => {
    return HttpResponse.json({ id: 'detalle-001' }, { status: 201 });
  }),

  http.patch('/api/panel/curriculo/planes/:id/detalles/:idDetalle', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('/api/panel/curriculo/planes/:id/detalles/:idDetalle/estado', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
