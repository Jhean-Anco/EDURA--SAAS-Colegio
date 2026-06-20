import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  PeriodoAcademico,
  TipoPeriodoAcademico,
} from '../../dominio/entidades/periodo-academico';
import {
  RepositorioAniosAcademicos,
  RepositorioPeriodosAcademicos,
} from '../../dominio/puertos/repositorios';

export interface CrearPeriodoAcademicoEntrada {
  id: string;
  anioAcademicoId: string;
  institucionId: string;
  nombre: string;
  tipo: TipoPeriodoAcademico;
  orden: number;
  fechaInicio: Date;
  fechaFin: Date;
}

export class CrearPeriodoAcademicoCasoUso {
  constructor(
    private readonly repositorioAnios: RepositorioAniosAcademicos,
    private readonly repositorioPeriodos: RepositorioPeriodosAcademicos,
  ) {}

  async ejecutar(
    entrada: CrearPeriodoAcademicoEntrada,
  ): Promise<PeriodoAcademico> {
    if (entrada.fechaFin <= entrada.fechaInicio) {
      throw new ConflictException(
        'La fecha de fin debe ser posterior a la de inicio',
      );
    }

    const anio = await this.repositorioAnios.buscarPorId(
      entrada.anioAcademicoId,
      entrada.institucionId,
    );
    if (!anio) {
      throw new NotFoundException('Año académico no encontrado');
    }
    if (anio.estado === 'CERRADO' || anio.estado === 'ANULADO') {
      throw new ConflictException(
        `No se pueden agregar períodos a un año en estado ${anio.estado}`,
      );
    }

    if (
      entrada.fechaInicio < anio.fechaInicio ||
      entrada.fechaFin > anio.fechaFin
    ) {
      throw new ConflictException(
        'Las fechas del período deben estar dentro del año académico',
      );
    }

    const periodo: PeriodoAcademico = {
      id: entrada.id,
      anioAcademicoId: entrada.anioAcademicoId,
      institucionId: entrada.institucionId,
      nombre: entrada.nombre,
      tipo: entrada.tipo,
      orden: entrada.orden,
      fechaInicio: entrada.fechaInicio,
      fechaFin: entrada.fechaFin,
      estado: 'PLANIFICADO',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    await this.repositorioPeriodos.guardar(periodo);
    return periodo;
  }
}
