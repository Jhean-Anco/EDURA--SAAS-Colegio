import { PlanEstudioNoEncontradoError } from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  ConsultadorCurriculo,
  PlanEstudioResumen,
} from '../../dominio/puertos/curriculo.puerto';

export class ListarDetallesPlanEstudioConsulta {
  constructor(private readonly consultador: ConsultadorCurriculo) {}

  async ejecutar(
    idPlan: string,
    alcance: AlcanceAcceso,
  ): Promise<PlanEstudioResumen> {
    const plan = await this.consultador.obtenerPlan(
      idPlan,
      alcance.institucionId,
    );
    if (!plan) throw new PlanEstudioNoEncontradoError();
    return plan;
  }
}
