import { NotFoundException } from '@nestjs/common';
import {
  RepositorioPersonas,
  RepositorioVinculosPersonaMembresia,
} from '../../dominio/puertos/repositorios';

export interface VincularPersonaMembresiaEntrada {
  personaId: string;
  membresiaId: string;
  institucionEducativaId: string;
}

export class VincularPersonaMembresiaCasoUso {
  constructor(
    private readonly personas: RepositorioPersonas,
    private readonly vinculos: RepositorioVinculosPersonaMembresia,
  ) {}

  async vincular(entrada: VincularPersonaMembresiaEntrada): Promise<void> {
    const persona = await this.personas.buscarPorIdEnInstitucion(
      entrada.personaId,
      entrada.institucionEducativaId,
    );
    if (!persona) {
      throw new NotFoundException('PERSONA_NO_ENCONTRADA');
    }
    await this.vinculos.vincular({
      personaId: entrada.personaId,
      membresiaId: entrada.membresiaId,
    });
  }

  async desvincular(entrada: VincularPersonaMembresiaEntrada): Promise<void> {
    const persona = await this.personas.buscarPorIdEnInstitucion(
      entrada.personaId,
      entrada.institucionEducativaId,
    );
    if (!persona) {
      throw new NotFoundException('PERSONA_NO_ENCONTRADA');
    }
    await this.vinculos.desvincular({
      personaId: entrada.personaId,
      membresiaId: entrada.membresiaId,
    });
  }
}
