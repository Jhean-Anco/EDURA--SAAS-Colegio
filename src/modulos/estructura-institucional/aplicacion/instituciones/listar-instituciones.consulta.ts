import { InstitucionTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/institucion.typeorm-repositorio';

export class ListarInstitucionesConsulta {
  constructor(private readonly repositorio: InstitucionTypeormRepositorio) {}

  async ejecutar() {
    return this.repositorio.listarPaginado();
  }
}
