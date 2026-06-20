import { NotFoundException } from '@nestjs/common';
import { AnioAcademico } from '../../dominio/entidades/anio-academico';
import { RepositorioAniosAcademicos } from '../../dominio/puertos/repositorios';

export class ObtenerAnioConsulta {
  constructor(private readonly repositorio: RepositorioAniosAcademicos) {}

  async ejecutar(id: string, institucionId: string): Promise<AnioAcademico> {
    const anio = await this.repositorio.buscarPorId(id, institucionId);
    if (!anio) {
      throw new NotFoundException('Año académico no encontrado');
    }
    return anio;
  }
}
