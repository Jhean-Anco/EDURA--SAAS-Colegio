import {
  DocenteTutorCesadoError,
  DocenteTutorInactivoError,
  SeccionAcademicaNoEncontradaError,
  TutorFueraDeSedeError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioOfertaAcademica,
} from '../../dominio/puertos/estructura-academica.puerto';

export class AsignarTutorSeccionCasoUso {
  constructor(private readonly repositorio: RepositorioOfertaAcademica) {}

  async ejecutar(
    idSeccion: string,
    idDocenteTutor: string | null,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const seccion = await this.repositorio.obtenerSeccionBase(
      idSeccion,
      alcance.institucionId,
    );
    if (!seccion) throw new SeccionAcademicaNoEncontradaError();

    if (
      alcance.ambito === 'SEDE' &&
      alcance.sedeId &&
      seccion.idSede !== alcance.sedeId
    ) {
      throw new SeccionAcademicaNoEncontradaError();
    }

    if (idDocenteTutor) {
      const tutor = await this.repositorio.verificarDocenteTutorEnSede(
        idDocenteTutor,
        seccion.idSede,
        alcance.institucionId,
      );
      if (!tutor.estaActivo) throw new DocenteTutorInactivoError();
      if (tutor.estaCesado) throw new DocenteTutorCesadoError();
      if (!tutor.tieneAsignacion) throw new TutorFueraDeSedeError();
    }

    await this.repositorio.actualizarSeccion({
      id: idSeccion,
      institucionId: alcance.institucionId,
      idDocenteTutor: idDocenteTutor,
    });
  }
}
