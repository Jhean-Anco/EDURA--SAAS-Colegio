import {
  PeriodoAcademicoNoEncontradoError,
  PeriodoCodigoDuplicadoError,
  PeriodoSolapamientoError,
  TransicionPeriodoInvalidaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioCalendarioAcademico,
  TipoPeriodo,
} from '../../dominio/puertos/estructura-academica.puerto';

const ESTADOS_EDITABLES = ['PLANIFICADO', 'ACTIVO'] as const;

export interface EntradaActualizarPeriodoAcademico {
  id: string;
  idAnioAcademico: string;
  codigo?: string;
  nombre?: string;
  tipo?: TipoPeriodo;
  orden?: number;
  fechaInicio?: string;
  fechaFin?: string;
  observacion?: string | null;
}

export class ActualizarPeriodoAcademicoCasoUso {
  constructor(private readonly repositorio: RepositorioCalendarioAcademico) {}

  async ejecutar(
    entrada: EntradaActualizarPeriodoAcademico,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const periodo = await this.repositorio.obtenerPeriodoBase(
      entrada.id,
      entrada.idAnioAcademico,
      alcance.institucionId,
    );
    if (!periodo) throw new PeriodoAcademicoNoEncontradoError();

    if (
      !ESTADOS_EDITABLES.includes(
        periodo.estado as (typeof ESTADOS_EDITABLES)[number],
      )
    ) {
      throw new TransicionPeriodoInvalidaError(periodo.estado, 'ACTUALIZAR');
    }

    let codigoNormalizado: string | undefined;
    if (entrada.codigo !== undefined) {
      codigoNormalizado = entrada.codigo.trim().toUpperCase();
      const codigoDuplicado = await this.repositorio.existeCodigoPeriodoEnAnio(
        codigoNormalizado,
        entrada.idAnioAcademico,
        alcance.institucionId,
        entrada.id,
      );
      if (codigoDuplicado) throw new PeriodoCodigoDuplicadoError();
    }

    if (entrada.orden !== undefined) {
      const ordenDuplicado = await this.repositorio.existeOrdenPeriodoEnAnio(
        entrada.orden,
        entrada.idAnioAcademico,
        alcance.institucionId,
        entrada.id,
      );
      if (ordenDuplicado) throw new PeriodoCodigoDuplicadoError();
    }

    if (entrada.fechaInicio !== undefined || entrada.fechaFin !== undefined) {
      const fechasActuales = await this.repositorio.obtenerFechasAnio(
        entrada.idAnioAcademico,
        alcance.institucionId,
      );

      // obtener las fechas actuales del periodo para construir el intervalo final
      const periodoFechas = await this.repositorio.obtenerPeriodoFechas(
        entrada.id,
        entrada.idAnioAcademico,
        alcance.institucionId,
      );

      const fechaInicioFinal =
        entrada.fechaInicio ?? periodoFechas!.fechaInicio;
      const fechaFinFinal = entrada.fechaFin ?? periodoFechas!.fechaFin;

      if (fechaFinFinal <= fechaInicioFinal) {
        throw new PeriodoCodigoDuplicadoError();
      }

      if (fechasActuales) {
        if (
          fechaInicioFinal < fechasActuales.fechaInicio ||
          fechaFinFinal > fechasActuales.fechaFin
        ) {
          throw new PeriodoSolapamientoError();
        }
      }

      const solapamiento = await this.repositorio.existeSolapamientoPeriodo({
        idAnio: entrada.idAnioAcademico,
        institucionId: alcance.institucionId,
        fechaInicio: fechaInicioFinal,
        fechaFin: fechaFinFinal,
        excluirId: entrada.id,
      });
      if (solapamiento) throw new PeriodoSolapamientoError();
    }

    await this.repositorio.actualizarPeriodoAcademico({
      id: entrada.id,
      idAnioAcademico: entrada.idAnioAcademico,
      institucionId: alcance.institucionId,
      codigo: entrada.codigo !== undefined ? entrada.codigo.trim() : undefined,
      codigoNormalizado,
      nombre: entrada.nombre,
      tipo: entrada.tipo,
      orden: entrada.orden,
      fechaInicio: entrada.fechaInicio,
      fechaFin: entrada.fechaFin,
      observacion: entrada.observacion,
    });
  }
}
