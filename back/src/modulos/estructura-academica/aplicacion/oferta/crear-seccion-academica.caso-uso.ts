import {
  CapacidadSuperaAforoError,
  DocenteTutorCesadoError,
  DocenteTutorInactivoError,
  EspacioFisicoFueraDeSedeError,
  EspacioInactivoError,
  EspacioNoEsAulaError,
  OfertaGradoSedeNoEncontradaError,
  SeccionNombreDuplicadoError,
  TutorFueraDeSedeError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioOfertaAcademica,
} from '../../dominio/puertos/estructura-academica.puerto';

export interface EntradaCrearSeccionAcademica {
  idOfertaGradoSede: string;
  codigo: string;
  nombre: string;
  turno: string;
  capacidadMaxima: number;
  idDocenteTutor?: string | null;
  idEspacioFisico?: string | null;
}

export class CrearSeccionAcademicaCasoUso {
  constructor(private readonly repositorio: RepositorioOfertaAcademica) {}

  async ejecutar(
    entrada: EntradaCrearSeccionAcademica,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    const oferta = await this.repositorio.obtenerOfertaBase(
      entrada.idOfertaGradoSede,
      alcance.institucionId,
    );
    if (!oferta) throw new OfertaGradoSedeNoEncontradaError();

    if (
      alcance.ambito === 'SEDE' &&
      alcance.sedeId &&
      oferta.idSede !== alcance.sedeId
    ) {
      throw new OfertaGradoSedeNoEncontradaError();
    }

    const codigoNormalizado = entrada.codigo.trim().toUpperCase();
    const existe = await this.repositorio.existeSeccionEnOferta(
      codigoNormalizado,
      entrada.idOfertaGradoSede,
      alcance.institucionId,
    );
    if (existe) throw new SeccionNombreDuplicadoError();

    if (entrada.idEspacioFisico) {
      const espacio = await this.repositorio.verificarEspacioFisicoEnSede(
        entrada.idEspacioFisico,
        oferta.idSede,
      );
      if (!espacio) throw new EspacioFisicoFueraDeSedeError();
      if (!espacio.esAula) throw new EspacioNoEsAulaError();
      if (!espacio.estaActivo) throw new EspacioInactivoError();
      if (
        entrada.capacidadMaxima &&
        espacio.aforo !== null &&
        entrada.capacidadMaxima > espacio.aforo
      ) {
        throw new CapacidadSuperaAforoError();
      }
    }

    if (entrada.idDocenteTutor) {
      const tutor = await this.repositorio.verificarDocenteTutorEnSede(
        entrada.idDocenteTutor,
        oferta.idSede,
        alcance.institucionId,
      );
      if (!tutor.estaActivo) throw new DocenteTutorInactivoError();
      if (tutor.estaCesado) throw new DocenteTutorCesadoError();
      if (!tutor.tieneAsignacion) throw new TutorFueraDeSedeError();
    }

    return this.repositorio.crearSeccionAcademica({
      institucionId: alcance.institucionId,
      idOfertaGradoSede: entrada.idOfertaGradoSede,
      codigo: entrada.codigo.trim(),
      codigoNormalizado,
      nombre: entrada.nombre.trim(),
      turno: entrada.turno,
      capacidadMaxima: entrada.capacidadMaxima,
      idDocenteTutor: entrada.idDocenteTutor ?? null,
      idEspacioFisico: entrada.idEspacioFisico ?? null,
    });
  }
}
