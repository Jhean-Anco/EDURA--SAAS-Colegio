import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginaSedeResumenPersistencia,
  RepositorioPaginas,
  SeccionPaginaSedeResumenPersistencia,
} from '../../../../dominio/paginas/repositorio-paginas.puerto';
import { PaginaSedeTypeormEntidad } from '../entidades/pagina-sede.typeorm-entidad';
import { SeccionPaginaSedeTypeormEntidad } from '../entidades/seccion-pagina-sede.typeorm-entidad';

@Injectable()
export class PaginaTypeormRepositorio implements RepositorioPaginas {
  constructor(
    @InjectRepository(PaginaSedeTypeormEntidad)
    private readonly paginas: Repository<PaginaSedeTypeormEntidad>,
    @InjectRepository(SeccionPaginaSedeTypeormEntidad)
    private readonly secciones: Repository<SeccionPaginaSedeTypeormEntidad>,
  ) {}

  async crear(
    pagina: Partial<PaginaSedeTypeormEntidad>,
  ): Promise<PaginaSedeResumenPersistencia> {
    return this.paginas.save(this.paginas.create(pagina));
  }

  async agregarSeccion(
    paginaId: string,
    sedeId: string,
    seccion: Partial<SeccionPaginaSedeTypeormEntidad>,
  ): Promise<SeccionPaginaSedeResumenPersistencia> {
    const pagina = await this.buscarPorIdYSede(paginaId, sedeId);
    if (!pagina) {
      throw new Error('RECURSO_NO_ENCONTRADO');
    }
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
  ): Promise<PaginaSedeResumenPersistencia | null> {
    const resultado = await this.paginas.update(
      { id, sedeId },
      { estado: 'PUBLICADA' },
    );
    if ((resultado.affected ?? 0) !== 1) {
      return null;
    }
    return this.paginas.findOne({ where: { id, sedeId } });
  }

  async archivar(
    id: string,
    sedeId: string,
  ): Promise<PaginaSedeResumenPersistencia | null> {
    const resultado = await this.paginas.update(
      { id, sedeId },
      { estado: 'ARCHIVADA' },
    );
    if ((resultado.affected ?? 0) !== 1) {
      return null;
    }
    return this.paginas.findOne({ where: { id, sedeId } });
  }

  async restaurar(
    id: string,
    sedeId: string,
  ): Promise<PaginaSedeResumenPersistencia | null> {
    const resultado = await this.paginas.update(
      { id, sedeId },
      { estado: 'BORRADOR' },
    );
    if ((resultado.affected ?? 0) !== 1) {
      return null;
    }
    return this.paginas.findOne({ where: { id, sedeId } });
  }

  async publicarSeccion(
    id: string,
    idPagina: string,
    _sedeId: string,
  ): Promise<SeccionPaginaSedeResumenPersistencia | null> {
    await this.secciones
      .createQueryBuilder()
      .update()
      .set({ estado: 'ACTIVA', visible: true })
      .where('id = :id', { id })
      .andWhere('id_pagina_sede = :idPagina', { idPagina })
      .andWhere(
        `id_pagina_sede IN (
          SELECT p.id FROM paginas_sede p WHERE p.id = :idPagina AND p.id_sede = :sedeId
        )`,
        { idPagina, sedeId: _sedeId },
      )
      .execute();
    return this.secciones.findOne({
      where: { id, paginaSedeId: idPagina },
      relations: ['paginaSede'],
    });
  }

  async buscarPorIdYSede(
    idPagina: string,
    sedeId: string,
  ): Promise<PaginaSedeResumenPersistencia | null> {
    return this.paginas.findOne({ where: { id: idPagina, sedeId } });
  }

  async buscarSeccionPorIdYPagina(
    idSeccion: string,
    idPagina: string,
    _sedeId: string,
  ): Promise<SeccionPaginaSedeResumenPersistencia | null> {
    return this.secciones.findOne({
      where: { id: idSeccion, paginaSedeId: idPagina },
      relations: ['paginaSede'],
    });
  }
}
