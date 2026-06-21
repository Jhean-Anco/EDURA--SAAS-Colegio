import {
  EspacioFisicoFueraDeSedeError,
  SeccionAcademicaNoEncontradaError,
  SeccionNombreDuplicadoError,
  TutorFueraDeSedeError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoSeccion,
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
  estado?: EstadoSeccion;
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
      const espacioOk = await this.repositorio.verificarEspacioFisicoEnSede(
        entrada.idEspacioFisico,
        seccion.idSede,
      );
      if (!espacioOk) throw new EspacioFisicoFueraDeSedeError();
    }

    if (entrada.idDocenteTutor) {
      const tutorOk = await this.repositorio.verificarDocenteTutorEnSede(
        entrada.idDocenteTutor,
        seccion.idSede,
        alcance.institucionId,
      );
      if (!tutorOk) throw new TutorFueraDeSedeError();
    }

    await this.repositorio.actualizarSeccion({
      id: entrada.id,
      institucionId: alcance.institucionId,
      nombre: entrada.nombre,
      turno: entrada.turno,
      capacidadMaxima: entrada.capacidadMaxima,
      idDocenteTutor: entrada.idDocenteTutor,
      idEspacioFisico: entrada.idEspacioFisico,
      estado: entrada.estado,
    });
  }
}
