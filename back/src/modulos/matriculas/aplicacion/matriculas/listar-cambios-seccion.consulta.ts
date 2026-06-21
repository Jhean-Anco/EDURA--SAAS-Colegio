import {
  AlcanceAcceso,
  HistorialSeccion,
} from '../../dominio/matriculas/matricula';
import { MatriculasPuerto } from '../../dominio/puertos/matriculas.puerto';
import { MatriculaNoEncontradaError } from '../../dominio/errores-matriculas';

export class ListarCambiosSeccionConsulta {
  constructor(private readonly repositorio: MatriculasPuerto) {}

  async ejecutar(
    idMatricula: string,
    alcance: AlcanceAcceso,
  ): Promise<HistorialSeccion[]> {
    const matricula = await this.repositorio.buscarPorId(idMatricula, alcance);
    if (!matricula) {
      throw new MatriculaNoEncontradaError();
    }
    return this.repositorio.obtenerHistorialSecciones(idMatricula, alcance);
  }
}
