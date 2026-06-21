import {
  SeccionAcademicaNoEncontradaError,
  TransicionSeccionInvalidaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoSeccion,
  RepositorioOfertaAcademica,
} from '../../dominio/puertos/estructura-academica.puerto';

const TRANSICIONES_SECCION: Record<EstadoSeccion, EstadoSeccion[]> = {
  PLANIFICADA: ['ACTIVA', 'INACTIVA'],
  ACTIVA: ['CERRADA', 'INACTIVA'],
  CERRADA: [],
  INACTIVA: ['PLANIFICADA'],
};

export class CambiarEstadoSeccionAcademicaCasoUso {
  constructor(private readonly repositorio: RepositorioOfertaAcademica) {}

  async ejecutar(
    id: string,
    nuevoEstado: EstadoSeccion,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const seccion = await this.repositorio.obtenerSeccionBase(
      id,
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

    const permitidos = TRANSICIONES_SECCION[seccion.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new TransicionSeccionInvalidaError(seccion.estado, nuevoEstado);
    }

    await this.repositorio.cambiarEstadoSeccion(
      id,
      alcance.institucionId,
      nuevoEstado,
    );
  }
}
