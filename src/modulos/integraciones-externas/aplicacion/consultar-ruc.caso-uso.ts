import { BadRequestException } from '@nestjs/common';
import {
  ConsultadorRuc,
  ResultadoConsultaRuc,
} from '../dominio/puertos/consultador-ruc';

export class ConsultarRucCasoUso {
  constructor(private readonly consultadorRuc: ConsultadorRuc) {}

  async ejecutar(ruc: string): Promise<ResultadoConsultaRuc> {
    const rucNormalizado = ruc.trim();
    if (!/^\d{11}$/.test(rucNormalizado)) {
      throw new BadRequestException('El RUC debe tener exactamente 11 dígitos');
    }
    return this.consultadorRuc.consultar(rucNormalizado);
  }
}
