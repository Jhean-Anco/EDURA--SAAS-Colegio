import {
  AreaCurricularNoEncontradaError,
  AreaConAsignaturasActivasError,
  TransicionAreaInvalidaError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  EstadoArea,
  RepositorioAreasCurriculares,
} from '../../dominio/puertos/curriculo.puerto';

const TRANSICIONES_AREA: Record<EstadoArea, EstadoArea[]> = {
  ACTIVA: ['INACTIVA'],
  INACTIVA: ['ACTIVA'],
};

export class CambiarEstadoAreaCurricularCasoUso {
  constructor(private readonly repositorio: RepositorioAreasCurriculares) {}

  async ejecutar(
    id: string,
    nuevoEstado: EstadoArea,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    const area = await this.repositorio.obtenerAreaBase(
      id,
      alcance.institucionId,
    );
    if (!area) throw new AreaCurricularNoEncontradaError();

    const permitidos = TRANSICIONES_AREA[area.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new TransicionAreaInvalidaError(area.estado, nuevoEstado);
    }

    // RN-CUR-003: no inactivar con asignaturas activas
    if (nuevoEstado === 'INACTIVA') {
      if (
        await this.repositorio.tieneAsignaturasActivas(
          id,
          alcance.institucionId,
        )
      ) {
        throw new AreaConAsignaturasActivasError();
      }
    }

    await this.repositorio.cambiarEstadoArea(
      id,
      alcance.institucionId,
      nuevoEstado,
    );
  }
}
