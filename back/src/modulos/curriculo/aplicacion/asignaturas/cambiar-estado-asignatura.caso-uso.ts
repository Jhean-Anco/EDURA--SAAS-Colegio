import {
  AsignaturaNoEncontradaError,
  AsignaturaEnUsoError,
  TransicionAsignaturaInvalidaError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  EstadoAsignatura,
  RepositorioAsignaturas,
} from '../../dominio/puertos/curriculo.puerto';

const TRANSICIONES_ASIGNATURA: Record<EstadoAsignatura, EstadoAsignatura[]> = {
  ACTIVA: ['INACTIVA'],
  INACTIVA: ['ACTIVA'],
};

export class CambiarEstadoAsignaturaCasoUso {
  constructor(private readonly repositorio: RepositorioAsignaturas) {}

  async ejecutar(
    id: string,
    nuevoEstado: EstadoAsignatura,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    const asignatura = await this.repositorio.obtenerAsignaturaBase(
      id,
      alcance.institucionId,
    );
    if (!asignatura) throw new AsignaturaNoEncontradaError();

    const permitidos = TRANSICIONES_ASIGNATURA[asignatura.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new TransicionAsignaturaInvalidaError(
        asignatura.estado,
        nuevoEstado,
      );
    }

    // RN-CUR-004: no inactivar si usada en plan BORRADOR/APROBADO/VIGENTE
    if (nuevoEstado === 'INACTIVA') {
      if (
        await this.repositorio.estaAsignaturaEnPlanActivo(
          id,
          alcance.institucionId,
        )
      ) {
        throw new AsignaturaEnUsoError();
      }
    }

    await this.repositorio.cambiarEstadoAsignatura(
      id,
      alcance.institucionId,
      nuevoEstado,
    );
  }
}
