import { Inject } from '@nestjs/common';
import {
  REPOSITORIO_SEDES,
  RepositorioSedes,
} from '../../dominio/sedes/repositorio-sedes.puerto';

export class ListarSedesInstitucionConsulta {
  constructor(
    @Inject(REPOSITORIO_SEDES)
    private readonly repositorio: RepositorioSedes,
  ) {}

  async ejecutar(institucionId: string) {
    return this.repositorio.listarPorInstitucion(institucionId);
  }
}
