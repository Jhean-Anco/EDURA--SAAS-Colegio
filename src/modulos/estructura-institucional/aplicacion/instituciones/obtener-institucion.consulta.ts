import { Inject } from '@nestjs/common';
import {
  REPOSITORIO_INSTITUCIONES,
  RepositorioInstituciones,
} from '../../dominio/instituciones/repositorio-instituciones.puerto';

export class ObtenerInstitucionConsulta {
  constructor(
    @Inject(REPOSITORIO_INSTITUCIONES)
    private readonly repositorio: RepositorioInstituciones,
  ) {}

  async ejecutar(id: string) {
    return this.repositorio.buscarPorId(id);
  }
}
