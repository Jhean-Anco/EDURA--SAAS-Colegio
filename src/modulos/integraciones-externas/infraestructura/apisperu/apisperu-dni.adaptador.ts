import { Injectable } from '@nestjs/common';
import { ConfiguracionAplicacion } from '../../../../configuracion/configuracion-aplicacion';
import {
  ConsultadorDni,
  ResultadoConsultaDni,
} from '../../dominio/puertos/consultador-dni';

interface RespuestaApisDni {
  success: boolean;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  message?: string;
}

@Injectable()
export class ApisperuDniAdaptador implements ConsultadorDni {
  constructor(private readonly config: ConfiguracionAplicacion) {}

  async consultar(numeroDni: string): Promise<ResultadoConsultaDni> {
    const token = this.config.apisperuToken;
    if (!token) {
      return {
        disponible: false,
        datosSugeridos: null,
        advertencias: ['Token APIsPeru no configurado (APISPERU_TOKEN)'],
      };
    }

    const url = `${this.config.apisperuUrlBase}/dni/${numeroDni}?token=${token}`;
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

      const datos = (await respuesta.json()) as RespuestaApisDni;

      if (!datos.success || !datos.nombres) {
        return {
          disponible: true,
          datosSugeridos: null,
          advertencias: [datos.message ?? 'DNI no encontrado en APIsPeru'],
        };
      }

      return {
        disponible: true,
        datosSugeridos: {
          nombres: datos.nombres,
          apellidoPaterno: datos.apellidoPaterno ?? '',
          apellidoMaterno: datos.apellidoMaterno ?? '',
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
