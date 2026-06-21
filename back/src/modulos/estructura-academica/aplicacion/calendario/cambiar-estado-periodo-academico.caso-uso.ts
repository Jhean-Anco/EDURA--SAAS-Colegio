import {
  PeriodoAcademicoNoEncontradoError,
  PeriodoEnCursoYaExisteError,
  TransicionPeriodoInvalidaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoCalendario,
  RepositorioCalendarioAcademico,
} from '../../dominio/puertos/estructura-academica.puerto';

const TRANSICIONES_VALIDAS: Record<EstadoCalendario, EstadoCalendario[]> = {
  PLANIFICADO: ['ACTIVO', 'ANULADO'],
  ACTIVO: ['CERRADO', 'ANULADO'],
  CERRADO: [],
  ANULADO: [],
};

export class CambiarEstadoPeriodoAcademicoCasoUso {
  constructor(private readonly repositorio: RepositorioCalendarioAcademico) {}

  async ejecutar(
    id: string,
    idAnioAcademico: string,
    nuevoEstado: EstadoCalendario,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const periodo = await this.repositorio.obtenerPeriodoBase(
      id,
      idAnioAcademico,
      alcance.institucionId,
    );
    if (!periodo) throw new PeriodoAcademicoNoEncontradoError();

    const permitidos = TRANSICIONES_VALIDAS[periodo.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new TransicionPeriodoInvalidaError(periodo.estado, nuevoEstado);
    }

    if (nuevoEstado === 'ACTIVO') {
      const hayActivo = await this.repositorio.existePeriodoActivoEnAnio(
        idAnioAcademico,
        alcance.institucionId,
      );
      if (hayActivo) throw new PeriodoEnCursoYaExisteError();
    }

    await this.repositorio.cambiarEstadoPeriodo(
      id,
      idAnioAcademico,
      alcance.institucionId,
      nuevoEstado,
    );
  }
}
