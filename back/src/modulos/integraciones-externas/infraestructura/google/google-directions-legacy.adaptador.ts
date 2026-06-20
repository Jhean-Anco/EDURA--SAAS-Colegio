import { Injectable } from '@nestjs/common';
import { ConfiguracionAplicacion } from '../../../../configuracion/configuracion-aplicacion';
import {
  CalculadorRutas,
  PuntoGeografico,
  ResultadoCalculoRuta,
} from '../../dominio/puertos/calculador-rutas';

interface GoogleDirectionsLeg {
  distance: { value: number; text: string };
  duration: { value: number; text: string };
}

interface GoogleDirectionsRespuesta {
  status: string;
  routes?: Array<{
    summary: string;
    legs: GoogleDirectionsLeg[];
  }>;
  error_message?: string;
}

@Injectable()
export class GoogleDirectionsLegacyAdaptador implements CalculadorRutas {
  private readonly urlBase =
    'https://maps.googleapis.com/maps/api/directions/json';

  constructor(private readonly config: ConfiguracionAplicacion) {}

  async calcular(
    origen: PuntoGeografico,
    destino: PuntoGeografico,
  ): Promise<ResultadoCalculoRuta> {
    const apiKey = process.env['GOOGLE_MAPS_API_KEY'];
    if (!apiKey) {
      return {
        disponible: false,
        resultado: null,
        advertencias: [
          'Clave de Google Maps no configurada (GOOGLE_MAPS_API_KEY)',
        ],
      };
    }

    const origenStr = `${origen.latitud},${origen.longitud}`;
    const destinoStr = `${destino.latitud},${destino.longitud}`;
    const url = `${this.urlBase}?origin=${origenStr}&destination=${destinoStr}&key=${apiKey}&language=es&mode=driving`;

    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      this.config.googleMapsTimeoutMs,
    );

    try {
      const respuesta = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!respuesta.ok) {
        return {
          disponible: true,
          resultado: null,
          advertencias: [
            `Google Directions respondió con estado ${respuesta.status}`,
          ],
        };
      }

      const datos = (await respuesta.json()) as GoogleDirectionsRespuesta;

      if (datos.status !== 'OK' || !datos.routes?.[0]?.legs?.[0]) {
        return {
          disponible: true,
          resultado: null,
          advertencias: [
            datos.error_message ?? `Google Directions: ${datos.status}`,
          ],
        };
      }

      const leg = datos.routes[0].legs[0];
      const resumen = datos.routes[0].summary;

      return {
        disponible: true,
        resultado: {
          distanciaMetros: leg.distance.value,
          duracionSegundos: leg.duration.value,
          resumenRuta: resumen
            ? `${resumen} — ${leg.distance.text} — ${leg.duration.text}`
            : `${leg.distance.text} — ${leg.duration.text}`,
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
            ? 'Google Directions no respondió en el tiempo límite'
            : 'Error al contactar Google Directions',
        ],
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
