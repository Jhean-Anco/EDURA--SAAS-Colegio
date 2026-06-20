import { PeriodoAcademico } from '../../dominio/entidades/periodo-academico';
import { RepositorioPeriodosAcademicos } from '../../dominio/puertos/repositorios';

export class ListarPeriodosConsulta {
  constructor(private readonly repositorio: RepositorioPeriodosAcademicos) {}

  ejecutar(
    anioAcademicoId: string,
    institucionId: string,
  ): Promise<PeriodoAcademico[]> {
    return this.repositorio.listarPorAnio(anioAcademicoId, institucionId);
  }
}
