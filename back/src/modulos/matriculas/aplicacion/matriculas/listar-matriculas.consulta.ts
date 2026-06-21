import { AlcanceAcceso, Matricula } from '../../dominio/matriculas/matricula';
import {
  MatriculasPuerto,
  FiltrosListarMatriculas,
} from '../../dominio/puertos/matriculas.puerto';

export class ListarMatriculasConsulta {
  constructor(private readonly repositorio: MatriculasPuerto) {}

  async ejecutar(
    filtros: FiltrosListarMatriculas,
    alcance: AlcanceAcceso,
  ): Promise<{ total: number; datos: Matricula[] }> {
    return this.repositorio.listar(filtros, alcance);
  }
}
