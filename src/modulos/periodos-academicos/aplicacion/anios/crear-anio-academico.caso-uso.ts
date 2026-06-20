import { ConflictException } from '@nestjs/common';
import { AnioAcademico } from '../../dominio/entidades/anio-academico';
import { RepositorioAniosAcademicos } from '../../dominio/puertos/repositorios';

export interface CrearAnioAcademicoEntrada {
  id: string;
  institucionId: string;
  nombre: string;
  anio: number;
  fechaInicio: Date;
  fechaFin: Date;
}

export class CrearAnioAcademicoCasoUso {
  constructor(private readonly repositorio: RepositorioAniosAcademicos) {}

  async ejecutar(entrada: CrearAnioAcademicoEntrada): Promise<AnioAcademico> {
    if (entrada.fechaFin <= entrada.fechaInicio) {
      throw new ConflictException(
        'La fecha de fin debe ser posterior a la de inicio',
      );
    }

    const existente = await this.repositorio.buscarPorAnio(
      entrada.anio,
      entrada.institucionId,
    );
    if (existente) {
      throw new ConflictException(
        `Ya existe un año académico ${entrada.anio} para esta institución`,
      );
    }

    const anio: AnioAcademico = {
      id: entrada.id,
      institucionId: entrada.institucionId,
      nombre: entrada.nombre,
      anio: entrada.anio,
      fechaInicio: entrada.fechaInicio,
      fechaFin: entrada.fechaFin,
      estado: 'PLANIFICADO',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    await this.repositorio.guardar(anio);
    return anio;
  }
}
