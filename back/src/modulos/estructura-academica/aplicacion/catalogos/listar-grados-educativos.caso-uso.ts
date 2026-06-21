import {
  AlcanceAcceso,
  ConsultadorEstructuraAcademica,
  EstadoNivel,
  GradoEducativoResumen,
} from '../../dominio/puertos/estructura-academica.puerto';

export class ListarGradosEducativosCasoUso {
  constructor(private readonly consultador: ConsultadorEstructuraAcademica) {}

  async ejecutar(
    alcance: AlcanceAcceso,
    idNivel?: string | null,
    estado?: EstadoNivel | null,
  ): Promise<GradoEducativoResumen[]> {
    return this.consultador.listarGrados(
      alcance.institucionId,
      idNivel,
      estado,
    );
  }
}
