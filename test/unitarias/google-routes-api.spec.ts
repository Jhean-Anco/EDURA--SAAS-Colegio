import { GoogleRoutesApiAdaptador } from '../../src/modulos/integraciones-externas/infraestructura/google/google-routes-api.adaptador';
import { ConfiguracionAplicacion } from '../../src/configuracion/configuracion-aplicacion';

function crearConfig(
  overrides: Partial<ConfiguracionAplicacion> = {},
): ConfiguracionAplicacion {
  return {
    googleRoutesApiKey: 'test-api-key',
    googleRoutesUrlBase:
      'https://routes.googleapis.com/directions/v2:computeRoutes',
    googleMapsTimeoutMs: 4000,
    ...overrides,
  } as ConfiguracionAplicacion;
}

const ORIGEN = { latitud: -12.0464, longitud: -77.0428 };
const DESTINO = { latitud: -13.5319, longitud: -71.9675 };

describe('GoogleRoutesApiAdaptador', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retorna disponible=false cuando no hay API key configurada', async () => {
    const adaptador = new GoogleRoutesApiAdaptador(
      crearConfig({ googleRoutesApiKey: '' }),
    );
    const resultado = await adaptador.calcular(ORIGEN, DESTINO);
    expect(resultado.disponible).toBe(false);
    expect(resultado.resultado).toBeNull();
    expect(resultado.advertencias[0]).toMatch(/GOOGLE_ROUTES_API_KEY/);
  });

  it('retorna resultado correcto cuando la API responde OK', async () => {
    const respuestaApi = {
      routes: [
        {
          distanceMeters: 842000,
          duration: '31200s',
          description: 'Ruta por Abancay',
        },
      ],
    };
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(respuestaApi),
    } as unknown as Response);

    const adaptador = new GoogleRoutesApiAdaptador(crearConfig());
    const resultado = await adaptador.calcular(ORIGEN, DESTINO);

    expect(resultado.disponible).toBe(true);
    expect(resultado.resultado).not.toBeNull();
    expect(resultado.resultado?.distanciaMetros).toBe(842000);
    expect(resultado.resultado?.duracionSegundos).toBe(31200);
    expect(resultado.resultado?.resumenRuta).toContain('Ruta por Abancay');
  });

  it('parsea correctamente la duración en formato "Xs"', async () => {
    const respuestaApi = {
      routes: [{ distanceMeters: 10000, duration: '600s', description: '' }],
    };
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(respuestaApi),
    } as unknown as Response);

    const adaptador = new GoogleRoutesApiAdaptador(crearConfig());
    const resultado = await adaptador.calcular(ORIGEN, DESTINO);

    expect(resultado.resultado?.duracionSegundos).toBe(600);
  });

  it('retorna disponible=false cuando la API responde con error HTTP', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({}),
    } as unknown as Response);

    const adaptador = new GoogleRoutesApiAdaptador(crearConfig());
    const resultado = await adaptador.calcular(ORIGEN, DESTINO);

    expect(resultado.disponible).toBe(false);
    expect(resultado.advertencias[0]).toMatch(/403/);
  });

  it('retorna disponible=false y mensaje de timeout cuando fetch es abortado', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(
      Object.assign(new Error('The operation was aborted'), {
        name: 'AbortError',
      }),
    );

    const adaptador = new GoogleRoutesApiAdaptador(
      crearConfig({ googleMapsTimeoutMs: 100 }),
    );
    const resultado = await adaptador.calcular(ORIGEN, DESTINO);

    expect(resultado.disponible).toBe(false);
    expect(resultado.advertencias[0]).toMatch(/tiempo límite/);
  });

  it('retorna disponible=false y mensaje genérico en error de red', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network failure'));

    const adaptador = new GoogleRoutesApiAdaptador(crearConfig());
    const resultado = await adaptador.calcular(ORIGEN, DESTINO);

    expect(resultado.disponible).toBe(false);
    expect(resultado.advertencias[0]).toMatch(/contactar/);
  });

  it('formatea distancia en km cuando supera 1000 m', async () => {
    const respuestaApi = {
      routes: [{ distanceMeters: 5500, duration: '300s', description: '' }],
    };
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(respuestaApi),
    } as unknown as Response);

    const adaptador = new GoogleRoutesApiAdaptador(crearConfig());
    const resultado = await adaptador.calcular(ORIGEN, DESTINO);

    expect(resultado.resultado?.resumenRuta).toContain('5.5 km');
  });

  it('abre el circuit breaker tras tres fallos consecutivos', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network failure'));

    const adaptador = new GoogleRoutesApiAdaptador(crearConfig());

    // Cada llamada reintenta 2 veces internamente antes de contar como fallo
    await adaptador.calcular(ORIGEN, DESTINO);
    await adaptador.calcular(ORIGEN, DESTINO);
    await adaptador.calcular(ORIGEN, DESTINO);

    // El cuarto intento debe ser rechazado por el circuit breaker sin llamar fetch
    jest.restoreAllMocks();
    const fetchSpy = jest.spyOn(global, 'fetch');
    const resultado = await adaptador.calcular(ORIGEN, DESTINO);

    expect(resultado.disponible).toBe(false);
    expect(resultado.advertencias[0]).toMatch(/circuit breaker/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
