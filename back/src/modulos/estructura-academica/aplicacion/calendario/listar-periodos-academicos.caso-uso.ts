import {
  AlcanceAcceso,
  ConsultadorEstructuraAcademica,
  EstadoCalendario,
  PeriodoAcademicoResumen,
} from '../../dominio/puertos/estructura-academica.puerto';

export class ListarPeriodosAcademicosCasoUso {
  constructor(private readonly consultador: ConsultadorEstructuraAcademica) {}

  async ejecutar(
    idAnioAcademico: string,
    alcance: AlcanceAcceso,
    estado?: EstadoCalendario | null,
  ): Promise<PeriodoAcademicoResumen[]> {
    return this.consultador.listarPeriodos(
      idAnioAcademico,
      alcance.institucionId,
      estado,
    );
  }
}
