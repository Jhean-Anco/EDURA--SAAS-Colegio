import {
  CapacidadSuperaAforoError,
  DocenteTutorCesadoError,
  DocenteTutorInactivoError,
  EspacioFisicoFueraDeSedeError,
  EspacioInactivoError,
  EspacioNoEsAulaError,
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
  idOfertaGradoSede?: string;
  codigo?: string;
  nombre?: string;
  turno?: string;
  capacidadMaxima?: number;
  idDocenteTutor?: string | null;
  idEspacioFisico?: string | null;
}

async function validarEspacioFisico(
  repositorio: RepositorioOfertaAcademica,
  idEspacioFisico: string,
  idSede: string,
  capacidadEfectiva: number | null,
): Promise<void> {
  const espacio = await repositorio.verificarEspacioFisicoEnSede(
    idEspacioFisico,
    idSede,
  );
  if (!espacio) throw new EspacioFisicoFueraDeSedeError();
  if (!espacio.esAula) throw new EspacioNoEsAulaError();
  if (!espacio.estaActivo) throw new EspacioInactivoError();
  if (
    capacidadEfectiva &&
    espacio.aforo !== null &&
    capacidadEfectiva > espacio.aforo
  ) {
    throw new CapacidadSuperaAforoError();
  }
}

async function validarDocenteTutor(
  repositorio: RepositorioOfertaAcademica,
  idDocenteTutor: string,
  idSede: string,
  institucionId: string,
): Promise<void> {
  const tutor = await repositorio.verificarDocenteTutorEnSede(
    idDocenteTutor,
    idSede,
    institucionId,
  );
  if (!tutor.estaActivo) throw new DocenteTutorInactivoError();
  if (tutor.estaCesado) throw new DocenteTutorCesadoError();
  if (!tutor.tieneAsignacion) throw new TutorFueraDeSedeError();
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
      entrada.idOfertaGradoSede !== undefined &&
      seccion.idOfertaGradoSede !== entrada.idOfertaGradoSede
    ) {
      throw new SeccionAcademicaNoEncontradaError();
    }

    if (
      alcance.ambito === 'SEDE' &&
      alcance.sedeId &&
      seccion.idSede !== alcance.sedeId
    ) {
      throw new SeccionAcademicaNoEncontradaError();
    }

    if (entrada.codigo !== undefined) {
      const codigoNorm = entrada.codigo.trim().toUpperCase();
      const existe = await this.repositorio.existeSeccionEnOferta(
        codigoNorm,
        seccion.idOfertaGradoSede,
        alcance.institucionId,
        entrada.id,
      );
      if (existe) throw new SeccionNombreDuplicadoError();
    }

    if (entrada.idEspacioFisico) {
      const capacidadEfectiva =
        entrada.capacidadMaxima ?? seccion.capacidadMaxima;
      await validarEspacioFisico(
        this.repositorio,
        entrada.idEspacioFisico,
        seccion.idSede,
        capacidadEfectiva,
      );
    }

    if (entrada.idDocenteTutor) {
      await validarDocenteTutor(
        this.repositorio,
        entrada.idDocenteTutor,
        seccion.idSede,
        alcance.institucionId,
      );
    }

    const codigoNormalizado =
      entrada.codigo === undefined
        ? undefined
        : entrada.codigo.trim().toUpperCase();

    await this.repositorio.actualizarSeccion({
      id: entrada.id,
      institucionId: alcance.institucionId,
      codigo: entrada.codigo === undefined ? undefined : entrada.codigo.trim(),
      codigoNormalizado,
      nombre: entrada.nombre,
      turno: entrada.turno,
      capacidadMaxima: entrada.capacidadMaxima,
      idDocenteTutor: entrada.idDocenteTutor,
      idEspacioFisico: entrada.idEspacioFisico,
    });
  }
}
