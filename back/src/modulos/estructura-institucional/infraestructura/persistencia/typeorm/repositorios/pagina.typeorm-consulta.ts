import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginaSedeTypeormEntidad } from '../entidades/pagina-sede.typeorm-entidad';
import { PaginaRespuesta } from '../../../../presentacion/http/respuestas/pagina.respuesta';

@Injectable()
export class PaginaTypeormConsulta {
  constructor(
    @InjectRepository(PaginaSedeTypeormEntidad)
    private readonly repositorio: Repository<PaginaSedeTypeormEntidad>,
  ) {}

  async listarPorSede(sedeId: string): Promise<PaginaRespuesta[]> {
    const entidades = await this.repositorio.find({
      where: { sedeId },
      order: { ordenMenu: 'ASC', titulo: 'ASC' },
    });
    return entidades.map((entidad) => this.mapear(entidad));
  }

  async obtenerPorSlug(
    sedeId: string,
    slug: string,
  ): Promise<PaginaRespuesta | null> {
    const entidad = await this.repositorio.findOne({ where: { sedeId, slug } });
    return entidad ? this.mapear(entidad) : null;
  }

  private mapear(entidad: PaginaSedeTypeormEntidad): PaginaRespuesta {
    return {
      id: entidad.id,
      sedeId: entidad.sedeId,
      slug: entidad.slug,
      titulo: entidad.titulo,
      resumen: entidad.resumen,
      descripcionSeo: entidad.descripcionSeo,
      esPaginaInicio: entidad.esPaginaInicio,
      visibleEnMenu: entidad.visibleEnMenu,
      ordenMenu: entidad.ordenMenu,
      estado: entidad.estado,
      fechaPublicacion: entidad.fechaPublicacion,
      version: entidad.version,
    };
  }
}
