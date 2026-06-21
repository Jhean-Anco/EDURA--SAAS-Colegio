import {
  AlcanceAcceso,
  HistorialEstado,
} from '../../dominio/matriculas/matricula';
import { MatriculasPuerto } from '../../dominio/puertos/matriculas.puerto';
import { MatriculaNoEncontradaError } from '../../dominio/errores-matriculas';

export class ListarHistorialEstadosConsulta {
  constructor(private readonly repositorio: MatriculasPuerto) {}

  async ejecutar(
    idMatricula: string,
    alcance: AlcanceAcceso,
  ): Promise<HistorialEstado[]> {
    const matricula = await this.repositorio.buscarPorId(idMatricula, alcance);
    if (!matricula) {
      throw new MatriculaNoEncontradaError();
    }
    return this.repositorio.obtenerHistorialEstados(idMatricula, alcance);
  }
}
