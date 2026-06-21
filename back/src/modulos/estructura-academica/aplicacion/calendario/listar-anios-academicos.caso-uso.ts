import {
  AlcanceAcceso,
  AnioAcademicoResumen,
  ConsultadorEstructuraAcademica,
  EstadoCalendario,
} from '../../dominio/puertos/estructura-academica.puerto';

export class ListarAniosAcademicosCasoUso {
  constructor(private readonly consultador: ConsultadorEstructuraAcademica) {}

  async ejecutar(
    alcance: AlcanceAcceso,
    estado?: EstadoCalendario | null,
  ): Promise<AnioAcademicoResumen[]> {
    return this.consultador.listarAnios(alcance.institucionId, estado);
  }
}
