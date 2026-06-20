import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginaSedeTypeormEntidad } from '../entidades/pagina-sede.typeorm-entidad';

@Injectable()
export class PaginaTypeormConsulta {
  constructor(
    @InjectRepository(PaginaSedeTypeormEntidad)
    private readonly repositorio: Repository<PaginaSedeTypeormEntidad>,
  ) {}

  async listarPorSede(sedeId: string): Promise<PaginaSedeTypeormEntidad[]> {
    return this.repositorio.find({
      where: { sedeId },
      order: { ordenMenu: 'ASC', titulo: 'ASC' },
    });
  }

  async obtenerPorSlug(
    sedeId: string,
    slug: string,
  ): Promise<PaginaSedeTypeormEntidad | null> {
    return this.repositorio.findOne({ where: { sedeId, slug } });
  }
}
