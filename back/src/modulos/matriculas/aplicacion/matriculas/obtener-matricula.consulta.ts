import { AlcanceAcceso, Matricula } from '../../dominio/matriculas/matricula';
import { MatriculasPuerto } from '../../dominio/puertos/matriculas.puerto';
import { MatriculaNoEncontradaError } from '../../dominio/errores-matriculas';

export class ObtenerMatriculaConsulta {
  constructor(private readonly repositorio: MatriculasPuerto) {}

  async ejecutar(id: string, alcance: AlcanceAcceso): Promise<Matricula> {
    const matricula = await this.repositorio.buscarPorId(id, alcance);
    if (!matricula) {
      throw new MatriculaNoEncontradaError();
    }
    return matricula;
  }
}
