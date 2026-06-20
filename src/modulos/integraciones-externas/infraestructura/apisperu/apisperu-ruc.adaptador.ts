import { Injectable } from '@nestjs/common';
import { ConfiguracionAplicacion } from '../../../../configuracion/configuracion-aplicacion';
import {
  ConsultadorRuc,
  ResultadoConsultaRuc,
} from '../../dominio/puertos/consultador-ruc';

interface RespuestaApisRuc {
  success: boolean;
  razonSocial?: string;
  nombreComercial?: string;
  direccion?: string;
  estado?: string;
  message?: string;
}

@Injectable()
export class ApisperuRucAdaptador implements ConsultadorRuc {
  constructor(private readonly config: ConfiguracionAplicacion) {}

  async consultar(ruc: string): Promise<ResultadoConsultaRuc> {
    const token = this.config.apisperuToken;
    if (!token) {
      return {
        disponible: false,
        datosSugeridos: null,
        advertencias: ['Token APIsPeru no configurado (APISPERU_TOKEN)'],
      };
    }

    const url = `${this.config.apisperuUrlBase}/ruc/${ruc}?token=${token}`;
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      this.config.apisperuTimeoutMs,
    );

    try {
      const respuesta = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!respuesta.ok) {
        return {
          disponible: true,
          datosSugeridos: null,
          advertencias: [`APIsPeru respondió con estado ${respuesta.status}`],
        };
      }

      const datos = (await respuesta.json()) as RespuestaApisRuc;

      if (!datos.success || !datos.razonSocial) {
        return {
          disponible: true,
          datosSugeridos: null,
          advertencias: [datos.message ?? 'RUC no encontrado en APIsPeru'],
        };
      }

      return {
        disponible: true,
        datosSugeridos: {
          razonSocial: datos.razonSocial,
          nombreComercial: datos.nombreComercial ?? null,
          direccionFiscal: datos.direccion ?? null,
          estado: datos.estado ?? 'DESCONOCIDO',
        },
        advertencias: [],
      };
    } catch (error: unknown) {
      const esTimeout = error instanceof Error && error.name === 'AbortError';
      return {
        disponible: false,
        datosSugeridos: null,
        advertencias: [
          esTimeout
            ? 'APIsPeru no respondió en el tiempo límite'
            : 'Error al contactar APIsPeru',
        ],
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
