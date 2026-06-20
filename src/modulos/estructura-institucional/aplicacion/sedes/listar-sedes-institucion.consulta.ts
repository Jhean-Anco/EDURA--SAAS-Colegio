import { SedeTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/sede.typeorm-repositorio';

export class ListarSedesInstitucionConsulta {
  constructor(private readonly repositorio: SedeTypeormRepositorio) {}

  async ejecutar(institucionId: string) {
    return this.repositorio.listarPorInstitucion(institucionId);
  }
}
