import { RepositorioInstituciones } from '../../dominio/instituciones/repositorio-instituciones.puerto';

export class ListarInstitucionesConsulta {
  constructor(private readonly repositorio: RepositorioInstituciones) {}

  async ejecutar() {
    return this.repositorio.listarPaginado();
  }
}
