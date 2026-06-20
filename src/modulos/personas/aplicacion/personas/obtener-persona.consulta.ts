import { Persona } from '../../dominio/personas/persona';
import { RepositorioPersonas } from '../../dominio/puertos/repositorios';

export class ObtenerPersonaConsulta {
  constructor(private readonly personas: RepositorioPersonas) {}

  ejecutar(
    personaId: string,
    institucionEducativaId: string,
  ): Promise<Persona | null> {
    return this.personas.buscarPorIdEnInstitucion(
      personaId,
      institucionEducativaId,
    );
  }
}
