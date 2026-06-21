import {
  AlcanceAcceso,
  AsignaturaResumen,
  ConsultadorCurriculo,
  EstadoAsignatura,
} from '../../dominio/puertos/curriculo.puerto';

export class ListarAsignaturasConsulta {
  constructor(private readonly consultador: ConsultadorCurriculo) {}

  async ejecutar(
    alcance: AlcanceAcceso,
    idArea?: string | null,
    estado?: EstadoAsignatura | null,
  ): Promise<AsignaturaResumen[]> {
    return this.consultador.listarAsignaturas(alcance.institucionId, idArea, estado);
  }
}
