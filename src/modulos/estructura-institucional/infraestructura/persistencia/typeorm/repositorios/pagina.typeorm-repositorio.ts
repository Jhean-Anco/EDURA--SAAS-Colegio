import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginaSedeTypeormEntidad } from '../entidades/pagina-sede.typeorm-entidad';
import { SeccionPaginaSedeTypeormEntidad } from '../entidades/seccion-pagina-sede.typeorm-entidad';

@Injectable()
export class PaginaTypeormRepositorio {
  constructor(
    @InjectRepository(PaginaSedeTypeormEntidad)
    private readonly paginas: Repository<PaginaSedeTypeormEntidad>,
    @InjectRepository(SeccionPaginaSedeTypeormEntidad)
    private readonly secciones: Repository<SeccionPaginaSedeTypeormEntidad>,
  ) {}

  async crear(
    pagina: Partial<PaginaSedeTypeormEntidad>,
  ): Promise<PaginaSedeTypeormEntidad> {
    return this.paginas.save(this.paginas.create(pagina));
  }

  async agregarSeccion(
    seccion: Partial<SeccionPaginaSedeTypeormEntidad>,
  ): Promise<SeccionPaginaSedeTypeormEntidad> {
    return this.secciones.save(this.secciones.create(seccion));
  }

  async listarPorSede(sedeId: string): Promise<PaginaSedeTypeormEntidad[]> {
    return this.paginas.find({
      where: { sedeId },
      order: { ordenMenu: 'ASC' },
    });
  }

  async publicar(
    id: string,
    sedeId: string,
  ): Promise<PaginaSedeTypeormEntidad | null> {
    await this.paginas.update({ id, sedeId }, { estado: 'PUBLICADA' });
    return this.paginas.findOne({ where: { id, sedeId } });
  }

  async archivar(
    id: string,
    sedeId: string,
  ): Promise<PaginaSedeTypeormEntidad | null> {
    await this.paginas.update({ id, sedeId }, { estado: 'ARCHIVADA' });
    return this.paginas.findOne({ where: { id, sedeId } });
  }

  async restaurar(
    id: string,
    sedeId: string,
  ): Promise<PaginaSedeTypeormEntidad | null> {
    await this.paginas.update({ id, sedeId }, { estado: 'BORRADOR' });
    return this.paginas.findOne({ where: { id, sedeId } });
  }

  async publicarSeccion(
    id: string,
    sedeId: string,
  ): Promise<SeccionPaginaSedeTypeormEntidad | null> {
    await this.secciones
      .createQueryBuilder()
      .update()
      .set({ estado: 'ACTIVA', visible: true })
      .where('id = :id', { id })
      .andWhere(
        `id_pagina_sede IN (
          SELECT p.id FROM paginas_sede p WHERE p.id = :idPagina AND p.id_sede = :sedeId
        )`,
        { idPagina: id, sedeId },
      )
      .execute();
    return this.secciones.findOne({
      where: { id },
      relations: ['paginaSede'],
    });
  }
}
