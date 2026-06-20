import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElementoInfraestructuraTypeormEntidad } from '../entidades/elemento-infraestructura.typeorm-entidad';

@Injectable()
export class RepositorioElementosInfraestructuraTypeormConsulta {
  constructor(
    @InjectRepository(ElementoInfraestructuraTypeormEntidad)
    private readonly repositorio: Repository<ElementoInfraestructuraTypeormEntidad>,
  ) {}

  listarPorSede(
    sedeId: string,
  ): Promise<ElementoInfraestructuraTypeormEntidad[]> {
    return this.repositorio.find({
      where: { sedeId },
      order: { fechaCreacion: 'DESC' },
    });
  }
}
