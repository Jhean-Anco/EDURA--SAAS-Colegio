import { Persona } from '../../dominio/personas/persona';
import { RepositorioPersonas } from '../../dominio/puertos/repositorios';

export class ListarPersonasConsulta {
  constructor(private readonly personas: RepositorioPersonas) {}

  ejecutar(
    institucionEducativaId: string,
    filtro: { texto?: string; estado?: string; pagina: number; tamano: number },
  ): Promise<{ datos: Persona[]; total: number }> {
    return this.personas.listarPorInstitucion(institucionEducativaId, filtro);
  }
}
