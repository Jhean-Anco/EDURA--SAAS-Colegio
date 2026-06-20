import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AnioAcademico,
  EstadoAnioAcademico,
} from '../../../../dominio/entidades/anio-academico';
import {
  PeriodoAcademico,
  EstadoPeriodoAcademico,
  TipoPeriodoAcademico,
} from '../../../../dominio/entidades/periodo-academico';
import {
  RepositorioAniosAcademicos,
  RepositorioPeriodosAcademicos,
} from '../../../../dominio/puertos/repositorios';
import {
  AnioAcademicoTypeormEntidad,
  PeriodoAcademicoTypeormEntidad,
} from '../entidades/periodos-academicos.typeorm-entidades';

@Injectable()
export class AniosAcademicosTypeormRepositorio implements RepositorioAniosAcademicos {
  constructor(
    @InjectRepository(AnioAcademicoTypeormEntidad)
    private readonly repo: Repository<AnioAcademicoTypeormEntidad>,
  ) {}

  async guardar(anio: AnioAcademico): Promise<void> {
    await this.repo.save({
      id: anio.id,
      institucionId: anio.institucionId,
      nombre: anio.nombre,
      anio: anio.anio,
      fechaInicio: anio.fechaInicio,
      fechaFin: anio.fechaFin,
      estado: anio.estado,
    });
  }

  async buscarPorId(
    id: string,
    institucionId: string,
  ): Promise<AnioAcademico | null> {
    const entidad = await this.repo.findOne({
      where: { id, institucionId },
    });
    return entidad ? this.mapear(entidad) : null;
  }

  async buscarPorAnio(
    anio: number,
    institucionId: string,
  ): Promise<AnioAcademico | null> {
    const entidad = await this.repo.findOne({
      where: { anio, institucionId },
    });
    return entidad ? this.mapear(entidad) : null;
  }

  async listar(institucionId: string): Promise<AnioAcademico[]> {
    const entidades = await this.repo.find({
      where: { institucionId },
      order: { anio: 'DESC' },
    });
    return entidades.map((e) => this.mapear(e));
  }

  async actualizarEstado(
    id: string,
    institucionId: string,
    estado: EstadoAnioAcademico,
  ): Promise<void> {
    await this.repo.update({ id, institucionId }, { estado });
  }

  private mapear(e: AnioAcademicoTypeormEntidad): AnioAcademico {
    return {
      id: e.id,
      institucionId: e.institucionId,
      nombre: e.nombre,
      anio: e.anio,
      fechaInicio: e.fechaInicio,
      fechaFin: e.fechaFin,
      estado: e.estado as EstadoAnioAcademico,
      fechaCreacion: e.fechaCreacion,
      fechaActualizacion: e.fechaActualizacion,
    };
  }
}

@Injectable()
export class PeriodosAcademicosTypeormRepositorio implements RepositorioPeriodosAcademicos {
  constructor(
    @InjectRepository(PeriodoAcademicoTypeormEntidad)
    private readonly repo: Repository<PeriodoAcademicoTypeormEntidad>,
  ) {}

  async guardar(periodo: PeriodoAcademico): Promise<void> {
    await this.repo.save({
      id: periodo.id,
      anioAcademicoId: periodo.anioAcademicoId,
      institucionId: periodo.institucionId,
      nombre: periodo.nombre,
      tipo: periodo.tipo,
      orden: periodo.orden,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      estado: periodo.estado,
    });
  }

  async buscarPorId(
    id: string,
    institucionId: string,
  ): Promise<PeriodoAcademico | null> {
    const entidad = await this.repo.findOne({
      where: { id, institucionId },
    });
    return entidad ? this.mapear(entidad) : null;
  }

  async listarPorAnio(
    anioAcademicoId: string,
    institucionId: string,
  ): Promise<PeriodoAcademico[]> {
    const entidades = await this.repo.find({
      where: { anioAcademicoId, institucionId },
      order: { orden: 'ASC' },
    });
    return entidades.map((e) => this.mapear(e));
  }

  async actualizarEstado(
    id: string,
    institucionId: string,
    estado: EstadoPeriodoAcademico,
  ): Promise<void> {
    await this.repo.update({ id, institucionId }, { estado });
  }

  private mapear(e: PeriodoAcademicoTypeormEntidad): PeriodoAcademico {
    return {
      id: e.id,
      anioAcademicoId: e.anioAcademicoId,
      institucionId: e.institucionId,
      nombre: e.nombre,
      tipo: e.tipo as TipoPeriodoAcademico,
      orden: e.orden,
      fechaInicio: e.fechaInicio,
      fechaFin: e.fechaFin,
      estado: e.estado as EstadoPeriodoAcademico,
      fechaCreacion: e.fechaCreacion,
      fechaActualizacion: e.fechaActualizacion,
    };
  }
}
