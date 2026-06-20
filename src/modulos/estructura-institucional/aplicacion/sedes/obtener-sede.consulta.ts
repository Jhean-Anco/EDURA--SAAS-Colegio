import { Inject } from '@nestjs/common';
import {
  REPOSITORIO_SEDES,
  RepositorioSedes,
} from '../../dominio/sedes/repositorio-sedes.puerto';

export class ObtenerSedeConsulta {
  constructor(
    @Inject(REPOSITORIO_SEDES)
    private readonly repositorio: RepositorioSedes,
  ) {}

  async ejecutar(id: string) {
    return this.repositorio.buscarPorId(id);
  }
}
