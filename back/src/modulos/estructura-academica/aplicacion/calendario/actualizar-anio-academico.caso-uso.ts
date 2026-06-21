import {
  AnioAcademicoNoEncontradoError,
  TransicionAnioInvalidaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioCalendarioAcademico,
} from '../../dominio/puertos/estructura-academica.puerto';

const ESTADOS_EDITABLES = ['PLANIFICADO', 'ACTIVO'] as const;

export class FechaFinMenorQueInicioError extends Error {
  readonly codigo = 'REGLA_NEGOCIO_INVALIDA';
  constructor() {
    super('La fecha de fin debe ser posterior a la fecha de inicio');
  }
}

export class PeriodoFueraDeAnioError extends Error {
  readonly codigo = 'REGLA_NEGOCIO_INVALIDA';
  constructor() {
    super(
      'El nuevo intervalo del año dejaría períodos activos fuera de sus fechas',
    );
  }
}

export interface EntradaActualizarAnioAcademico {
  id: string;
  nombre?: string;
  fechaInicio?: string;
  fechaFin?: string;
  observacion?: string | null;
}

export class ActualizarAnioAcademicoCasoUso {
  constructor(private readonly repositorio: RepositorioCalendarioAcademico) {}

  async ejecutar(
    entrada: EntradaActualizarAnioAcademico,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const anio = await this.repositorio.obtenerAnioBase(
      entrada.id,
      alcance.institucionId,
    );
    if (!anio) throw new AnioAcademicoNoEncontradoError();

    if (
      !ESTADOS_EDITABLES.includes(
        anio.estado as (typeof ESTADOS_EDITABLES)[number],
      )
    ) {
      throw new TransicionAnioInvalidaError(anio.estado, 'ACTUALIZAR');
    }

    const cambiaFechas =
      entrada.fechaInicio !== undefined || entrada.fechaFin !== undefined;

    if (cambiaFechas) {
      const fechasActuales = await this.repositorio.obtenerFechasAnio(
        entrada.id,
        alcance.institucionId,
      );

      const nuevaFechaInicio =
        entrada.fechaInicio ?? fechasActuales!.fechaInicio;
      const nuevaFechaFin = entrada.fechaFin ?? fechasActuales!.fechaFin;

      if (nuevaFechaFin <= nuevaFechaInicio) {
        throw new FechaFinMenorQueInicioError();
      }

      const hayPeriodoFuera =
        await this.repositorio.existePeriodoFueraDeIntervalo(
          entrada.id,
          alcance.institucionId,
          nuevaFechaInicio,
          nuevaFechaFin,
        );
      if (hayPeriodoFuera) throw new PeriodoFueraDeAnioError();
    }

    await this.repositorio.actualizarAnioAcademico({
      id: entrada.id,
      institucionId: alcance.institucionId,
      nombre: entrada.nombre,
      fechaInicio: entrada.fechaInicio,
      fechaFin: entrada.fechaFin,
      observacion: entrada.observacion,
    });
  }
}
