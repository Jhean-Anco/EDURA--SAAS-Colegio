import { Inject } from '@nestjs/common';
import {
  REPOSITORIO_INSTITUCIONES,
  RepositorioInstituciones,
} from '../../dominio/instituciones/repositorio-instituciones.puerto';

export class ListarInstitucionesConsulta {
  constructor(
    @Inject(REPOSITORIO_INSTITUCIONES)
    private readonly repositorio: RepositorioInstituciones,
  ) {}

  async ejecutar() {
    return this.repositorio.listarPaginado();
  }
}
