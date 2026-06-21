import {
  EspacioFisicoFueraDeSedeError,
  EspacioInactivoError,
  EspacioNoEsAulaError,
  CapacidadSuperaAforoError,
  DocenteTutorCesadoError,
  DocenteTutorInactivoError,
  SeccionAcademicaNoEncontradaError,
  SeccionNombreDuplicadoError,
  TutorFueraDeSedeError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioOfertaAcademica,
} from '../../dominio/puertos/estructura-academica.puerto';

export interface EntradaActualizarSeccionAcademica {
  id: string;
  codigo?: string;
  nombre?: string;
  turno?: string;
  capacidadMaxima?: number | null;
  idDocenteTutor?: string | null;
  idEspacioFisico?: string | null;
}

export class ActualizarSeccionAcademicaCasoUso {
  constructor(private readonly repositorio: RepositorioOfertaAcademica) {}

  async ejecutar(
    entrada: EntradaActualizarSeccionAcademica,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const seccion = await this.repositorio.obtenerSeccionBase(
      entrada.id,
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

    if (entrada.codigo !== undefined) {
      const codigoNormalizado = entrada.codigo.trim().toUpperCase();
      const existe = await this.repositorio.existeSeccionEnOferta(
        codigoNormalizado,
        seccion.idOfertaGradoSede,
        alcance.institucionId,
        entrada.id,
      );
      if (existe) throw new SeccionNombreDuplicadoError();
    }

    if (entrada.idEspacioFisico) {
      const espacio = await this.repositorio.verificarEspacioFisicoEnSede(
        entrada.idEspacioFisico,
        seccion.idSede,
      );
      if (!espacio) throw new EspacioFisicoFueraDeSedeError();
      if (!espacio.esAula) throw new EspacioNoEsAulaError();
      if (!espacio.estaActivo) throw new EspacioInactivoError();
      const cap =
        entrada.capacidadMaxima !== undefined
          ? entrada.capacidadMaxima
          : seccion.capacidadMaxima;
      if (cap && espacio.aforo !== null && cap > espacio.aforo) {
        throw new CapacidadSuperaAforoError();
      }
    }

    if (entrada.idDocenteTutor) {
      const tutor = await this.repositorio.verificarDocenteTutorEnSede(
        entrada.idDocenteTutor,
        seccion.idSede,
        alcance.institucionId,
      );
      if (!tutor.estaActivo) throw new DocenteTutorInactivoError();
      if (tutor.estaCesado) throw new DocenteTutorCesadoError();
      if (!tutor.tieneAsignacion) throw new TutorFueraDeSedeError();
    }

    const codigoNormalizado =
      entrada.codigo !== undefined
        ? entrada.codigo.trim().toUpperCase()
        : undefined;

    await this.repositorio.actualizarSeccion({
      id: entrada.id,
      institucionId: alcance.institucionId,
      codigo: entrada.codigo !== undefined ? entrada.codigo.trim() : undefined,
      codigoNormalizado,
      nombre: entrada.nombre,
      turno: entrada.turno,
      capacidadMaxima: entrada.capacidadMaxima,
      idDocenteTutor: entrada.idDocenteTutor,
      idEspacioFisico: entrada.idEspacioFisico,
    });
  }
}
