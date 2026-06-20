import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { EstadoIncompatibleError } from '../../../../../compartido/dominio/errores-dominio';
import { PaginaSedeTypeormEntidad } from '../../../infraestructura/persistencia/typeorm/entidades/pagina-sede.typeorm-entidad';
import { PaginaTypeormConsulta } from '../../../infraestructura/persistencia/typeorm/repositorios/pagina.typeorm-consulta';
import { PaginaTypeormRepositorio } from '../../../infraestructura/persistencia/typeorm/repositorios/pagina.typeorm-repositorio';

@Controller('sedes/:idSede/paginas')
export class PaginasControlador {
  constructor(
    private readonly consulta: PaginaTypeormConsulta,
    private readonly repositorio: PaginaTypeormRepositorio,
  ) {}

  @Get()
  async listar(@Param('idSede') idSede: string): Promise<unknown[]> {
    return this.consulta.listarPorSede(idSede);
  }

  @Post()
  async crear(
    @Param('idSede') idSede: string,
    @Body() solicitud: { slug: string; titulo: string },
  ): Promise<PaginaSedeTypeormEntidad> {
    return this.repositorio.crear({
      sedeId: idSede,
      slug: solicitud.slug,
      titulo: solicitud.titulo,
      estado: 'BORRADOR',
    });
  }

  @Post(':idPagina/secciones')
  async agregarSeccion(
    @Param('idPagina') idPagina: string,
    @Body()
    solicitud: {
      tipoSeccion: string;
      contenido: Record<string, unknown>;
      orden: number;
    },
  ): Promise<unknown> {
    return this.repositorio.agregarSeccion({
      paginaSedeId: idPagina,
      tipoSeccion: solicitud.tipoSeccion,
      contenido: solicitud.contenido,
      orden: solicitud.orden,
      visible: true,
      estado: 'ACTIVA',
    });
  }

  @Post(':idPagina/publicar')
  async publicar(
    @Param('idPagina') idPagina: string,
  ): Promise<PaginaSedeTypeormEntidad> {
    const pagina = await this.repositorio.publicar(idPagina);
    if (!pagina) throw new EstadoIncompatibleError('PAGINA_NO_ENCONTRADA');
    return pagina;
  }

  @Post(':idPagina/archivar')
  async archivar(
    @Param('idPagina') idPagina: string,
  ): Promise<PaginaSedeTypeormEntidad> {
    const pagina = await this.repositorio.archivar(idPagina);
    if (!pagina) throw new EstadoIncompatibleError('PAGINA_NO_ENCONTRADA');
    return pagina;
  }

  @Post(':idPagina/restaurar')
  async restaurar(
    @Param('idPagina') idPagina: string,
  ): Promise<PaginaSedeTypeormEntidad> {
    const pagina = await this.repositorio.restaurar(idPagina);
    if (!pagina) throw new EstadoIncompatibleError('PAGINA_NO_ENCONTRADA');
    return pagina;
  }

  @Patch(':idPagina/secciones/:idSeccion')
  async publicarSeccion(
    @Param('idSeccion') idSeccion: string,
  ): Promise<unknown> {
    return this.repositorio.publicarSeccion(idSeccion);
  }

  @Get(':slugPagina')
  async obtener(
    @Param('idSede') idSede: string,
    @Param('slugPagina') slugPagina: string,
  ): Promise<PaginaSedeTypeormEntidad | null> {
    return this.consulta.obtenerPorSlug(idSede, slugPagina);
  }
}
