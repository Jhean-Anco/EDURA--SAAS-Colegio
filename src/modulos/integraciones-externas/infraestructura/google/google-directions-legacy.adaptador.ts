import { Injectable } from '@nestjs/common';
import { ConfiguracionAplicacion } from '../../../../configuracion/configuracion-aplicacion';
import {
  CalculadorRutas,
  PuntoGeografico,
  ResultadoCalculoRuta,
} from '../../dominio/puertos/calculador-rutas';

interface GoogleDistanceMatrixRespuesta {
  status: string;
  rows?: Array<{
    elements: Array<{
      status: string;
      distance?: { value: number; text: string };
      duration?: { value: number; text: string };
    }>;
  }>;
}

@Injectable()
export class GoogleDirectionsLegacyAdaptador implements CalculadorRutas {
  private readonly urlBase =
    'https://maps.googleapis.com/maps/api/distancematrix/json';

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
    const url = `${this.urlBase}?origins=${origenStr}&destinations=${destinoStr}&key=${apiKey}&language=es&mode=driving`;

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
            `Google Maps respondió con estado ${respuesta.status}`,
          ],
        };
      }

      const datos = (await respuesta.json()) as GoogleDistanceMatrixRespuesta;

      if (datos.status !== 'OK' || !datos.rows?.[0]?.elements?.[0]) {
        return {
          disponible: true,
          resultado: null,
          advertencias: [`Google Maps: ${datos.status}`],
        };
      }

      const elemento = datos.rows[0].elements[0];
      if (
        elemento.status !== 'OK' ||
        !elemento.distance ||
        !elemento.duration
      ) {
        return {
          disponible: true,
          resultado: null,
          advertencias: [`Google Maps elemento: ${elemento.status}`],
        };
      }

      return {
        disponible: true,
        resultado: {
          distanciaMetros: elemento.distance.value,
          duracionSegundos: elemento.duration.value,
          resumenRuta: `${elemento.distance.text} — ${elemento.duration.text}`,
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
            ? 'Google Maps no respondió en el tiempo límite'
            : 'Error al contactar Google Maps',
        ],
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
