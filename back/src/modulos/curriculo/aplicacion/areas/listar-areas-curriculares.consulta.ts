import {
  AlcanceAcceso,
  AreaCurricularResumen,
  ConsultadorCurriculo,
  EstadoArea,
} from '../../dominio/puertos/curriculo.puerto';

export class ListarAreasCurricularesConsulta {
  constructor(private readonly consultador: ConsultadorCurriculo) {}

  async ejecutar(
    alcance: AlcanceAcceso,
    estado?: EstadoArea | null,
  ): Promise<AreaCurricularResumen[]> {
    return this.consultador.listarAreas(alcance.institucionId, estado);
  }
}
