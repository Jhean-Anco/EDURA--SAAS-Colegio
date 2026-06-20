import { Injectable } from '@nestjs/common';
import {
  CalculadorRutas,
  PuntoGeografico,
  ResultadoCalculoRuta,
} from '../../dominio/puertos/calculador-rutas';

@Injectable()
export class RutasNoDisponible implements CalculadorRutas {
  calcular(
    _origen: PuntoGeografico,
    _destino: PuntoGeografico,
  ): Promise<ResultadoCalculoRuta> {
    return Promise.resolve({
      disponible: false,
      resultado: null,
      advertencias: ['Integración de cálculo de rutas no habilitada'],
    });
  }
}
