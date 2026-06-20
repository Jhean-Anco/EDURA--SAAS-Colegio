import { BadRequestException } from '@nestjs/common';
import {
  CalculadorRutas,
  PuntoGeografico,
  ResultadoCalculoRuta,
} from '../dominio/puertos/calculador-rutas';

export class CalcularRutaCasoUso {
  constructor(private readonly calculadorRutas: CalculadorRutas) {}

  async ejecutar(
    origen: PuntoGeografico,
    destino: PuntoGeografico,
  ): Promise<ResultadoCalculoRuta> {
    this.validarPunto(origen, 'origen');
    this.validarPunto(destino, 'destino');
    return this.calculadorRutas.calcular(origen, destino);
  }

  private validarPunto(punto: PuntoGeografico, nombre: string): void {
    if (punto.latitud < -90 || punto.latitud > 90) {
      throw new BadRequestException(
        `Latitud de ${nombre} fuera de rango [-90, 90]`,
      );
    }
    if (punto.longitud < -180 || punto.longitud > 180) {
      throw new BadRequestException(
        `Longitud de ${nombre} fuera de rango [-180, 180]`,
      );
    }
  }
}
