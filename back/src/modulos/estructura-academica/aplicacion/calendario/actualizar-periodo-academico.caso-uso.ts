import {
  PeriodoAcademicoNoEncontradoError,
  PeriodoCodigoDuplicadoError,
  PeriodoSolapamientoError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioCalendarioAcademico,
  TipoPeriodo,
} from '../../dominio/puertos/estructura-academica.puerto';

export interface EntradaActualizarPeriodoAcademico {
  id: string;
  idAnioAcademico: string;
  codigo?: string;
  nombre?: string;
  tipo?: TipoPeriodo;
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

    if (entrada.codigo !== undefined) {
      const codigoDuplicado = await this.repositorio.existeCodigoPeriodoEnAnio(
        entrada.codigo,
        entrada.idAnioAcademico,
        alcance.institucionId,
        entrada.id,
      );
      if (codigoDuplicado) throw new PeriodoCodigoDuplicadoError();
    }

    if (entrada.fechaInicio !== undefined || entrada.fechaFin !== undefined) {
      const solapamiento = await this.repositorio.existeSolapamientoPeriodo({
        idAnio: entrada.idAnioAcademico,
        institucionId: alcance.institucionId,
        fechaInicio: entrada.fechaInicio ?? '',
        fechaFin: entrada.fechaFin ?? '',
        excluirId: entrada.id,
      });
      if (solapamiento) throw new PeriodoSolapamientoError();
    }

    await this.repositorio.actualizarPeriodoAcademico({
      id: entrada.id,
      idAnioAcademico: entrada.idAnioAcademico,
      institucionId: alcance.institucionId,
      nombre: entrada.nombre,
      tipo: entrada.tipo,
      fechaInicio: entrada.fechaInicio,
      fechaFin: entrada.fechaFin,
      observacion: entrada.observacion,
    });
  }
}
