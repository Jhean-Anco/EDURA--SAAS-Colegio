import { BadRequestException } from '@nestjs/common';
import {
  ConsultadorDni,
  ResultadoConsultaDni,
} from '../dominio/puertos/consultador-dni';

export class ConsultarDniCasoUso {
  constructor(private readonly consultadorDni: ConsultadorDni) {}

  async ejecutar(numeroDni: string): Promise<ResultadoConsultaDni> {
    const dniNormalizado = numeroDni.trim();
    if (!/^\d{8}$/.test(dniNormalizado)) {
      throw new BadRequestException('El DNI debe tener exactamente 8 dígitos');
    }
    return this.consultadorDni.consultar(dniNormalizado);
  }
}
