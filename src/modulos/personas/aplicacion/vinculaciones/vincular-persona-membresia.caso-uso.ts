import { RepositorioVinculosPersonaMembresia } from '../../dominio/puertos/repositorios';

export class VincularPersonaMembresiaCasoUso {
  constructor(private readonly vinculos: RepositorioVinculosPersonaMembresia) {}

  ejecutar(entrada: { personaId: string; membresiaId: string }): Promise<void> {
    return this.vinculos.vincular(entrada);
  }
}
