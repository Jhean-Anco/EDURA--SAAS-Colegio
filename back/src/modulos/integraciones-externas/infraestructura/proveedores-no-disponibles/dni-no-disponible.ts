import { Injectable } from '@nestjs/common';
import {
  ConsultadorDni,
  ResultadoConsultaDni,
} from '../../dominio/puertos/consultador-dni';

@Injectable()
export class DniNoDisponible implements ConsultadorDni {
  consultar(_numeroDni: string): Promise<ResultadoConsultaDni> {
    return Promise.resolve({
      disponible: false,
      datosSugeridos: null,
      advertencias: ['Integración de consulta de DNI no habilitada'],
    });
  }
}
