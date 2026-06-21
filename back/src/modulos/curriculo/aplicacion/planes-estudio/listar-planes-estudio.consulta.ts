import {
  AlcanceAcceso,
  ConsultadorCurriculo,
  EstadoPlan,
  PlanEstudioListaItem,
} from '../../dominio/puertos/curriculo.puerto';

export class ListarPlanesEstudioConsulta {
  constructor(private readonly consultador: ConsultadorCurriculo) {}

  async ejecutar(
    alcance: AlcanceAcceso,
    idAnio?: string | null,
    idGrado?: string | null,
    estado?: EstadoPlan | null,
  ): Promise<PlanEstudioListaItem[]> {
    return this.consultador.listarPlanes(
      alcance.institucionId,
      idAnio,
      idGrado,
      estado,
    );
  }
}
