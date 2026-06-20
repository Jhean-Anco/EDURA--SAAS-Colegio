import { Injectable } from '@nestjs/common';
import {
  ConsultadorRuc,
  ResultadoConsultaRuc,
} from '../../dominio/puertos/consultador-ruc';

@Injectable()
export class RucNoDisponible implements ConsultadorRuc {
  consultar(_ruc: string): Promise<ResultadoConsultaRuc> {
    return Promise.resolve({
      disponible: false,
      datosSugeridos: null,
      advertencias: ['Integración de consulta de RUC no habilitada'],
    });
  }
}
