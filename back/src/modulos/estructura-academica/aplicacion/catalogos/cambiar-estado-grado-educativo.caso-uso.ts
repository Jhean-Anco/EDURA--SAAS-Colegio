import {
  GradoEducativoNoEncontradoError,
  GradoEnUsoError,
  GradoTransicionInvalidaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoNivel,
  RepositorioCatalogosAcademicos,
} from '../../dominio/puertos/estructura-academica.puerto';

const TRANSICIONES_GRADO: Record<EstadoNivel, EstadoNivel[]> = {
  ACTIVO: ['INACTIVO'],
  INACTIVO: ['ACTIVO'],
};

export class CambiarEstadoGradoEducativoCasoUso {
  constructor(private readonly repositorio: RepositorioCatalogosAcademicos) {}

  async ejecutar(
    id: string,
    nuevoEstado: EstadoNivel,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const grado = await this.repositorio.obtenerGradoBase(
      id,
      alcance.institucionId,
    );
    if (!grado) throw new GradoEducativoNoEncontradoError();

    const permitidos = TRANSICIONES_GRADO[grado.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new GradoTransicionInvalidaError(grado.estado, nuevoEstado);
    }

    if (nuevoEstado === 'INACTIVO') {
      const tieneOfertas =
        await this.repositorio.tieneOfertasActivasOPlanificadas(
          id,
          alcance.institucionId,
        );
      if (tieneOfertas) throw new GradoEnUsoError();
    }

    await this.repositorio.cambiarEstadoGrado(
      id,
      alcance.institucionId,
      nuevoEstado,
    );
  }
}
