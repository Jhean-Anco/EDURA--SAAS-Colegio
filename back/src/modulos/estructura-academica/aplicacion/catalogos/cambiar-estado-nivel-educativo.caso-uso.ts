import {
  NivelEducativoNoEncontradoError,
  NivelEnUsoError,
  NivelTransicionInvalidaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoNivel,
  RepositorioCatalogosAcademicos,
} from '../../dominio/puertos/estructura-academica.puerto';

const TRANSICIONES_NIVEL: Record<EstadoNivel, EstadoNivel[]> = {
  ACTIVO: ['INACTIVO'],
  INACTIVO: ['ACTIVO'],
};

export class CambiarEstadoNivelEducativoCasoUso {
  constructor(private readonly repositorio: RepositorioCatalogosAcademicos) {}

  async ejecutar(
    id: string,
    nuevoEstado: EstadoNivel,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const nivel = await this.repositorio.obtenerNivelBase(
      id,
      alcance.institucionId,
    );
    if (!nivel) throw new NivelEducativoNoEncontradoError();

    const permitidos = TRANSICIONES_NIVEL[nivel.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new NivelTransicionInvalidaError(nivel.estado, nuevoEstado);
    }

    if (nuevoEstado === 'INACTIVO') {
      const tieneGrados = await this.repositorio.tieneGradosActivos(
        id,
        alcance.institucionId,
      );
      if (tieneGrados) throw new NivelEnUsoError();
    }

    await this.repositorio.cambiarEstadoNivel(
      id,
      alcance.institucionId,
      nuevoEstado,
    );
  }
}
