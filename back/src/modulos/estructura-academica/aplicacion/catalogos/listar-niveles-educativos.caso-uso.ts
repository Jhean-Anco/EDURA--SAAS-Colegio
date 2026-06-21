import {
  AlcanceAcceso,
  ConsultadorEstructuraAcademica,
  EstadoNivel,
  NivelEducativoResumen,
} from '../../dominio/puertos/estructura-academica.puerto';

export class ListarNivelesEducativosCasoUso {
  constructor(private readonly consultador: ConsultadorEstructuraAcademica) {}

  async ejecutar(
    alcance: AlcanceAcceso,
    estado?: EstadoNivel | null,
  ): Promise<NivelEducativoResumen[]> {
    return this.consultador.listarNiveles(alcance.institucionId, estado);
  }
}
