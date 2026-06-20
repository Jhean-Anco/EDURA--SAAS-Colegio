import { RepositorioSedes } from '../../dominio/sedes/repositorio-sedes.puerto';

export class ListarSedesInstitucionConsulta {
  constructor(private readonly repositorio: RepositorioSedes) {}

  async ejecutar(institucionId: string) {
    return this.repositorio.listarPorInstitucion(institucionId);
  }
}
