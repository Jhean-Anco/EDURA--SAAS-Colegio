import {
  AnioAcademicoNoEncontradoError,
  AnioConOfertasActivasError,
  AnioConPeriodosActivosError,
  AnioEnCursoYaExisteError,
  TransicionAnioInvalidaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoCalendario,
  RepositorioCalendarioAcademico,
  RepositorioOfertaAcademica,
} from '../../dominio/puertos/estructura-academica.puerto';

const TRANSICIONES_VALIDAS: Record<EstadoCalendario, EstadoCalendario[]> = {
  PLANIFICADO: ['ACTIVO', 'ANULADO'],
  ACTIVO: ['CERRADO', 'ANULADO'],
  CERRADO: [],
  ANULADO: [],
};

export class CambiarEstadoAnioAcademicoCasoUso {
  constructor(
    private readonly repositorio: RepositorioCalendarioAcademico,
    private readonly repositorioOferta: RepositorioOfertaAcademica,
  ) {}

  async ejecutar(
    id: string,
    nuevoEstado: EstadoCalendario,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const anio = await this.repositorio.obtenerAnioBase(
      id,
      alcance.institucionId,
    );
    if (!anio) throw new AnioAcademicoNoEncontradoError();

    const permitidos = TRANSICIONES_VALIDAS[anio.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new TransicionAnioInvalidaError(anio.estado, nuevoEstado);
    }

    if (nuevoEstado === 'ACTIVO') {
      const hayActivo = await this.repositorio.existeAnioActivo(
        alcance.institucionId,
      );
      if (hayActivo) throw new AnioEnCursoYaExisteError();
    }

    if (nuevoEstado === 'CERRADO') {
      const hayPeriodoActivo = await this.repositorio.existePeriodoActivoEnAnio(
        id,
        alcance.institucionId,
      );
      if (hayPeriodoActivo) throw new AnioConPeriodosActivosError();

      const hayOfertaActiva =
        await this.repositorioOferta.existeOfertaActivaOPlanificadaEnAnio(
          id,
          alcance.institucionId,
        );
      if (hayOfertaActiva) throw new AnioConOfertasActivasError();
    }

    await this.repositorio.cambiarEstadoAnio(
      id,
      alcance.institucionId,
      nuevoEstado,
    );
  }
}
