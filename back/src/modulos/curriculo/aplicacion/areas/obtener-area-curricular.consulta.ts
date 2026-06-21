import {
  AreaCurricularNoEncontradaError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  AreaCurricularResumen,
  ConsultadorCurriculo,
} from '../../dominio/puertos/curriculo.puerto';

export class ObtenerAreaCurricularConsulta {
  constructor(private readonly consultador: ConsultadorCurriculo) {}

  async ejecutar(
    id: string,
    alcance: AlcanceAcceso,
  ): Promise<AreaCurricularResumen> {
    const area = await this.consultador.obtenerArea(id, alcance.institucionId);
    if (!area) throw new AreaCurricularNoEncontradaError();
    return area;
  }
}
