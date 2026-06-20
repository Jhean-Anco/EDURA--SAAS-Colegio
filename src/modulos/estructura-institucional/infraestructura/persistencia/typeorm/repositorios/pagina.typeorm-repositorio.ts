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

  async publicar(id: string): Promise<PaginaSedeTypeormEntidad | null> {
    await this.paginas.update({ id }, { estado: 'PUBLICADA' });
    return this.paginas.findOne({ where: { id } });
  }

  async archivar(id: string): Promise<PaginaSedeTypeormEntidad | null> {
    await this.paginas.update({ id }, { estado: 'ARCHIVADA' });
    return this.paginas.findOne({ where: { id } });
  }

  async restaurar(id: string): Promise<PaginaSedeTypeormEntidad | null> {
    await this.paginas.update({ id }, { estado: 'BORRADOR' });
    return this.paginas.findOne({ where: { id } });
  }

  async publicarSeccion(
    id: string,
  ): Promise<SeccionPaginaSedeTypeormEntidad | null> {
    await this.secciones.update({ id }, { estado: 'ACTIVA', visible: true });
    return this.secciones.findOne({ where: { id } });
  }
}
