import { AsignaturaNoEncontradaError } from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  AsignaturaResumen,
  ConsultadorCurriculo,
} from '../../dominio/puertos/curriculo.puerto';

export class ObtenerAsignaturaConsulta {
  constructor(private readonly consultador: ConsultadorCurriculo) {}

  async ejecutar(
    id: string,
    alcance: AlcanceAcceso,
  ): Promise<AsignaturaResumen> {
    const asignatura = await this.consultador.obtenerAsignatura(
      id,
      alcance.institucionId,
    );
    if (!asignatura) throw new AsignaturaNoEncontradaError();
    return asignatura;
  }
}
