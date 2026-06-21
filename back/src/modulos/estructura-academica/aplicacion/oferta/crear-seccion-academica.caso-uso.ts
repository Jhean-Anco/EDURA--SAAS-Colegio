import {
  CapacidadSuperaAforoError,
  DocenteTutorCesadoError,
  DocenteTutorInactivoError,
  EspacioFisicoFueraDeSedeError,
  EspacioInactivoError,
  EspacioNoEsAulaError,
  OfertaGradoSedeNoEncontradaError,
  OfertaNoPermiteSeccionesError,
  SeccionNombreDuplicadoError,
  TutorFueraDeSedeError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoOferta,
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

const ESTADOS_OFERTA_SIN_SECCIONES = new Set<EstadoOferta>([
  'CERRADA',
  'CANCELADA',
]);

async function validarEspacio(
  repositorio: RepositorioOfertaAcademica,
  idEspacioFisico: string,
  idSede: string,
  capacidadMaxima: number,
): Promise<void> {
  const espacio = await repositorio.verificarEspacioFisicoEnSede(
    idEspacioFisico,
    idSede,
  );
  if (!espacio) throw new EspacioFisicoFueraDeSedeError();
  if (!espacio.esAula) throw new EspacioNoEsAulaError();
  if (!espacio.estaActivo) throw new EspacioInactivoError();
  if (
    capacidadMaxima &&
    espacio.aforo !== null &&
    capacidadMaxima > espacio.aforo
  ) {
    throw new CapacidadSuperaAforoError();
  }
}

async function validarDocente(
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

    if (ESTADOS_OFERTA_SIN_SECCIONES.has(oferta.estado)) {
      throw new OfertaNoPermiteSeccionesError();
    }

    const codigoNormalizado = entrada.codigo.trim().toUpperCase();
    const existe = await this.repositorio.existeSeccionEnOferta(
      codigoNormalizado,
      entrada.idOfertaGradoSede,
      alcance.institucionId,
    );
    if (existe) throw new SeccionNombreDuplicadoError();

    if (entrada.idEspacioFisico) {
      await validarEspacio(
        this.repositorio,
        entrada.idEspacioFisico,
        oferta.idSede,
        entrada.capacidadMaxima,
      );
    }

    if (entrada.idDocenteTutor) {
      await validarDocente(
        this.repositorio,
        entrada.idDocenteTutor,
        oferta.idSede,
        alcance.institucionId,
      );
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
