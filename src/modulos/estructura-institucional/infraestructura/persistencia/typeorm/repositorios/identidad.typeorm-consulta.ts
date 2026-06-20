import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentidadSedeTypeormEntidad } from '../entidades/identidad-sede.typeorm-entidad';

@Injectable()
export class IdentidadTypeormConsulta {
  constructor(
    @InjectRepository(IdentidadSedeTypeormEntidad)
    private readonly repositorio: Repository<IdentidadSedeTypeormEntidad>,
  ) {}

  async obtenerPorSede(
    sedeId: string,
  ): Promise<IdentidadSedeTypeormEntidad | null> {
    return this.repositorio.findOne({ where: { sedeId } });
  }
}
