import { Injectable } from '@nestjs/common';
import { ConfiguracionAplicacion } from '../../../../configuracion/configuracion-aplicacion';
import {
  CalculadorRutas,
  PuntoGeografico,
  ResultadoCalculoRuta,
} from '../../dominio/puertos/calculador-rutas';

interface GoogleRoutesRespuesta {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
    description?: string;
  }>;
}

type EstadoCircuito = 'CERRADO' | 'ABIERTO' | 'SEMI_ABIERTO';

const UMBRAL_FALLOS = 3;
const VENTANA_RECUPERACION_MS = 30_000;
const MAX_REINTENTOS = 2;
const BACKOFF_BASE_MS = 300;

@Injectable()
export class GoogleRoutesApiAdaptador implements CalculadorRutas {
  private readonly urlBase: string;
  private fallos = 0;
  private estado: EstadoCircuito = 'CERRADO';
  private ultimoFallo: number | null = null;

  constructor(private readonly config: ConfiguracionAplicacion) {
    this.urlBase =
      config.googleRoutesUrlBase ??
      'https://routes.googleapis.com/directions/v2:computeRoutes';
  }

  async calcular(
    origen: PuntoGeografico,
    destino: PuntoGeografico,
  ): Promise<ResultadoCalculoRuta> {
    if (this.estado === 'ABIERTO') {
      const ahora = Date.now();
      if (
        this.ultimoFallo !== null &&
        ahora - this.ultimoFallo > VENTANA_RECUPERACION_MS
      ) {
        this.estado = 'SEMI_ABIERTO';
      } else {
        return {
          disponible: false,
          resultado: null,
          advertencias: [
            'Servicio Google Routes temporalmente no disponible (circuit breaker abierto)',
          ],
        };
      }
    }

    const resultado = await this.intentarConReintentos(origen, destino);

    if (!resultado.disponible || resultado.resultado === null) {
      this.registrarFallo();
    } else {
      this.registrarExito();
    }

    return resultado;
  }

  private async intentarConReintentos(
    origen: PuntoGeografico,
    destino: PuntoGeografico,
    intento = 0,
  ): Promise<ResultadoCalculoRuta> {
    const resultado = await this.llamarApi(origen, destino);
    if (!resultado.disponible && intento < MAX_REINTENTOS) {
      await this.esperar(BACKOFF_BASE_MS * Math.pow(2, intento));
      return this.intentarConReintentos(origen, destino, intento + 1);
    }
    return resultado;
  }

  private async llamarApi(
    origen: PuntoGeografico,
    destino: PuntoGeografico,
  ): Promise<ResultadoCalculoRuta> {
    const apiKey = this.config.googleRoutesApiKey;
    if (!apiKey) {
      return {
        disponible: false,
        resultado: null,
        advertencias: [
          'Clave de Google Routes no configurada (GOOGLE_ROUTES_API_KEY)',
        ],
      };
    }

    const cuerpo = {
      origin: {
        location: {
          latLng: { latitude: origen.latitud, longitude: origen.longitud },
        },
      },
      destination: {
        location: {
          latLng: { latitude: destino.latitud, longitude: destino.longitud },
        },
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_UNAWARE',
      computeAlternativeRoutes: false,
      languageCode: 'es',
      units: 'METRIC',
    };

    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      this.config.googleMapsTimeoutMs,
    );

    try {
      const respuesta = await fetch(this.urlBase, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'routes.distanceMeters,routes.duration,routes.description',
        },
        body: JSON.stringify(cuerpo),
      });

      if (!respuesta.ok) {
        return {
          disponible: false,
          resultado: null,
          advertencias: [
            `Google Routes respondió con estado ${respuesta.status}`,
          ],
        };
      }

      const datos = (await respuesta.json()) as GoogleRoutesRespuesta;
      const ruta = datos.routes?.[0];

      if (!ruta || ruta.distanceMeters === undefined || !ruta.duration) {
        return {
          disponible: true,
          resultado: null,
          advertencias: ['Google Routes no devolvió una ruta válida'],
        };
      }

      const duracionSegundos = this.parsearDuracion(ruta.duration);

      return {
        disponible: true,
        resultado: {
          distanciaMetros: ruta.distanceMeters,
          duracionSegundos,
          resumenRuta: ruta.description
            ? `${ruta.description} — ${this.formatearDistancia(ruta.distanceMeters)} — ${this.formatearDuracion(duracionSegundos)}`
            : `${this.formatearDistancia(ruta.distanceMeters)} — ${this.formatearDuracion(duracionSegundos)}`,
        },
        advertencias: [],
      };
    } catch (error: unknown) {
      const esTimeout = error instanceof Error && error.name === 'AbortError';
      return {
        disponible: false,
        resultado: null,
        advertencias: [
          esTimeout
            ? 'Google Routes no respondió en el tiempo límite'
            : 'Error al contactar Google Routes API',
        ],
      };
    } finally {
      clearTimeout(timer);
    }
  }

  private parsearDuracion(duracion: string): number {
    // Google Routes devuelve duración como "1234s" o "1234.5s"
    const match = /^(\d+(?:\.\d+)?)s$/.exec(duracion);
    if (!match) return 0;
    return Math.round(parseFloat(match[1]));
  }

  private formatearDistancia(metros: number): string {
    if (metros >= 1000) {
      return `${(metros / 1000).toFixed(1)} km`;
    }
    return `${metros} m`;
  }

  private formatearDuracion(segundos: number): string {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    if (h > 0) return `${h} h ${m} min`;
    return `${m} min`;
  }

  private registrarFallo(): void {
    this.fallos += 1;
    this.ultimoFallo = Date.now();
    if (this.fallos >= UMBRAL_FALLOS) {
      this.estado = 'ABIERTO';
    }
  }

  private registrarExito(): void {
    this.fallos = 0;
    this.estado = 'CERRADO';
    this.ultimoFallo = null;
  }

  private esperar(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
