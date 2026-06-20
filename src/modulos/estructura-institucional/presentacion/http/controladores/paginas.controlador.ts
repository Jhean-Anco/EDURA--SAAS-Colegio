import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  AgregarSeccionPaginaCasoUso,
  ArchivarPaginaCasoUso,
  CambiarEstadoSeccionCasoUso,
  CrearPaginaSedeCasoUso,
  ListarPaginasSedeConsulta,
  ObtenerPaginaSedeConsulta,
  PublicarPaginaCasoUso,
  RestaurarPaginaCasoUso,
} from '../../../aplicacion/paginas/consultas-paginas';
import { PaginaSalida } from '../../../aplicacion/paginas/contratos/pagina.salida';
import { SeccionPaginaSalida } from '../../../aplicacion/paginas/contratos/seccion-pagina.salida';
import { PaginaRespuesta } from '../respuestas/pagina.respuesta';
import {
  CrearPaginaSolicitud,
  AgregarSeccionPaginaSolicitud,
} from '../solicitudes/pagina.solicitud';

@Controller('sedes/:idSede/paginas')
export class PaginasControlador {
  constructor(
    private readonly consulta: ListarPaginasSedeConsulta,
    private readonly obtener: ObtenerPaginaSedeConsulta,
    private readonly crearPagina: CrearPaginaSedeCasoUso,
    private readonly agregarSeccion: AgregarSeccionPaginaCasoUso,
    private readonly publicarPagina: PublicarPaginaCasoUso,
    private readonly archivarPagina: ArchivarPaginaCasoUso,
    private readonly restaurarPagina: RestaurarPaginaCasoUso,
    private readonly cambiarEstadoSeccion: CambiarEstadoSeccionCasoUso,
  ) {}

  @Get()
  async listar(@Param('idSede') idSede: string): Promise<PaginaRespuesta[]> {
    const paginas = await this.consulta.ejecutar(idSede);
    return paginas.map((pagina) => this.mapearPagina(pagina));
  }

  @Post()
  async crear(
    @Param('idSede') idSede: string,
    @Body() solicitud: CrearPaginaSolicitud,
  ): Promise<PaginaRespuesta> {
    return this.mapearPagina(
      await this.crearPagina.ejecutar({
        sedeId: idSede,
        slug: solicitud.slug,
        titulo: solicitud.titulo,
      }),
    );
  }

  @Post(':idPagina/secciones')
  async agregar(
    @Param('idPagina') idPagina: string,
    @Body() solicitud: AgregarSeccionPaginaSolicitud,
  ): Promise<SeccionPaginaSalida> {
    return this.agregarSeccion.ejecutar({
      paginaSedeId: idPagina,
      tipoSeccion: solicitud.tipoSeccion,
      contenido: solicitud.contenido ?? {},
      orden: solicitud.orden ?? 0,
    });
  }

  @Post(':idPagina/publicar')
  async publicar(
    @Param('idPagina') idPagina: string,
  ): Promise<PaginaRespuesta | null> {
    const pagina = await this.publicarPagina.ejecutar(idPagina);
    return pagina ? this.mapearPagina(pagina) : null;
  }

  @Post(':idPagina/archivar')
  async archivar(
    @Param('idPagina') idPagina: string,
  ): Promise<PaginaRespuesta | null> {
    const pagina = await this.archivarPagina.ejecutar(idPagina);
    return pagina ? this.mapearPagina(pagina) : null;
  }

  @Post(':idPagina/restaurar')
  async restaurar(
    @Param('idPagina') idPagina: string,
  ): Promise<PaginaRespuesta | null> {
    const pagina = await this.restaurarPagina.ejecutar(idPagina);
    return pagina ? this.mapearPagina(pagina) : null;
  }

  @Patch(':idPagina/secciones/:idSeccion')
  async cambiarSeccion(
    @Param('idSeccion') idSeccion: string,
  ): Promise<SeccionPaginaSalida | null> {
    return this.cambiarEstadoSeccion.ejecutar(idSeccion);
  }

  @Get(':slugPagina')
  async obtenerPagina(
    @Param('idSede') idSede: string,
    @Param('slugPagina') slugPagina: string,
  ): Promise<PaginaRespuesta | null> {
    const pagina = await this.obtener.ejecutar(idSede, slugPagina);
    return pagina ? this.mapearPagina(pagina) : null;
  }

  private mapearPagina(pagina: PaginaSalida): PaginaRespuesta {
    return {
      ...pagina,
      fechaPublicacion: pagina.fechaPublicacion,
    };
  }
}
