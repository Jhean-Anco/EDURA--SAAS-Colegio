import {
  AlcanceAcceso,
  ConsultadorDocentes,
  EspecialidadProfesionalResumen,
} from '../dominio/puertos/docentes.puerto';

export class ListarEspecialidadesCasoUso {
  constructor(private readonly consultador: ConsultadorDocentes) {}

  async ejecutar(
    alcance: AlcanceAcceso,
    estado?: string | null,
  ): Promise<EspecialidadProfesionalResumen[]> {
    return this.consultador.listarEspecialidades(alcance.institucionId, estado);
  }
}
