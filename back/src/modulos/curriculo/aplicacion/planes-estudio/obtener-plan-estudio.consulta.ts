import {
  PlanEstudioNoEncontradoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  ConsultadorCurriculo,
  PlanEstudioResumen,
} from '../../dominio/puertos/curriculo.puerto';

export class ObtenerPlanEstudioConsulta {
  constructor(private readonly consultador: ConsultadorCurriculo) {}

  async ejecutar(
    id: string,
    alcance: AlcanceAcceso,
  ): Promise<PlanEstudioResumen> {
    const plan = await this.consultador.obtenerPlan(id, alcance.institucionId);
    if (!plan) throw new PlanEstudioNoEncontradoError();
    return plan;
  }
}
