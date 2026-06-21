import {
  AnioAcademicoNoEncontradoError,
  PeriodoCodigoDuplicadoError,
  PeriodoSolapamientoError,
  TransicionAnioInvalidaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioCalendarioAcademico,
  TipoPeriodo,
} from '../../dominio/puertos/estructura-academica.puerto';

const ESTADOS_VALIDOS_PARA_PERIODO = ['PLANIFICADO', 'ACTIVO'] as const;

export interface EntradaCrearPeriodoAcademico {
  idAnioAcademico: string;
  codigo: string;
  nombre: string;
  tipo: TipoPeriodo;
  orden: number;
  fechaInicio: string;
  fechaFin: string;
  observacion?: string | null;
}

export class CrearPeriodoAcademicoCasoUso {
  constructor(private readonly repositorio: RepositorioCalendarioAcademico) {}

  async ejecutar(
    entrada: EntradaCrearPeriodoAcademico,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    const anio = await this.repositorio.obtenerAnioBase(
      entrada.idAnioAcademico,
      alcance.institucionId,
    );
    if (!anio) throw new AnioAcademicoNoEncontradoError();

    if (
      !ESTADOS_VALIDOS_PARA_PERIODO.includes(
        anio.estado as (typeof ESTADOS_VALIDOS_PARA_PERIODO)[number],
      )
    ) {
      throw new TransicionAnioInvalidaError(anio.estado, 'AGREGAR_PERIODO');
    }

    const fechasAnio = await this.repositorio.obtenerFechasAnio(
      entrada.idAnioAcademico,
      alcance.institucionId,
    );

    if (fechasAnio) {
      if (
        entrada.fechaInicio < fechasAnio.fechaInicio ||
        entrada.fechaFin > fechasAnio.fechaFin
      ) {
        throw new PeriodoSolapamientoError();
      }
    }

    const codigoNormalizado = entrada.codigo.trim().toUpperCase();
    const codigoDuplicado = await this.repositorio.existeCodigoPeriodoEnAnio(
      codigoNormalizado,
      entrada.idAnioAcademico,
      alcance.institucionId,
    );
    if (codigoDuplicado) throw new PeriodoCodigoDuplicadoError();

    const ordenDuplicado = await this.repositorio.existeOrdenPeriodoEnAnio(
      entrada.orden,
      entrada.idAnioAcademico,
      alcance.institucionId,
    );
    if (ordenDuplicado) throw new PeriodoCodigoDuplicadoError();

    const solapamiento = await this.repositorio.existeSolapamientoPeriodo({
      idAnio: entrada.idAnioAcademico,
      institucionId: alcance.institucionId,
      fechaInicio: entrada.fechaInicio,
      fechaFin: entrada.fechaFin,
    });
    if (solapamiento) throw new PeriodoSolapamientoError();

    return this.repositorio.crearPeriodoAcademico({
      institucionId: alcance.institucionId,
      idAnioAcademico: entrada.idAnioAcademico,
      codigo: entrada.codigo.trim(),
      codigoNormalizado,
      nombre: entrada.nombre.trim(),
      tipo: entrada.tipo,
      orden: entrada.orden,
      fechaInicio: entrada.fechaInicio,
      fechaFin: entrada.fechaFin,
      observacion: entrada.observacion ?? null,
    });
  }
}
