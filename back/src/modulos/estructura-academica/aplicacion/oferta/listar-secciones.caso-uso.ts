import {
  AlcanceAcceso,
  ConsultadorEstructuraAcademica,
  SeccionAcademicaResumen,
} from '../../dominio/puertos/estructura-academica.puerto';

export class ListarSeccionesCasoUso {
  constructor(private readonly consultador: ConsultadorEstructuraAcademica) {}

  async ejecutar(
    idOfertaGradoSede: string,
    alcance: AlcanceAcceso,
  ): Promise<SeccionAcademicaResumen[]> {
    return this.consultador.listarSecciones(
      idOfertaGradoSede,
      alcance.institucionId,
    );
  }
}
