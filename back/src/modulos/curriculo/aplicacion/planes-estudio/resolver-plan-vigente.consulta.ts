import { PlanVigenteNoEncontradoError } from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  ConsultadorCurriculo,
  PlanEstudioResumen,
} from '../../dominio/puertos/curriculo.puerto';

export class ResolverPlanVigenteConsulta {
  constructor(private readonly consultador: ConsultadorCurriculo) {}

  async ejecutar(
    idAnio: string,
    idGrado: string,
    alcance: AlcanceAcceso,
  ): Promise<PlanEstudioResumen> {
    const plan = await this.consultador.resolverPlanVigente(
      idAnio,
      idGrado,
      alcance.institucionId,
    );
    if (!plan) throw new PlanVigenteNoEncontradoError();
    return plan;
  }
}
