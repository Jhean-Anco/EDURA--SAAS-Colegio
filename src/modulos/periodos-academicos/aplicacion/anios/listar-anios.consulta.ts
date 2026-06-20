import { AnioAcademico } from '../../dominio/entidades/anio-academico';
import { RepositorioAniosAcademicos } from '../../dominio/puertos/repositorios';

export class ListarAniosConsulta {
  constructor(private readonly repositorio: RepositorioAniosAcademicos) {}

  ejecutar(institucionId: string): Promise<AnioAcademico[]> {
    return this.repositorio.listar(institucionId);
  }
}
