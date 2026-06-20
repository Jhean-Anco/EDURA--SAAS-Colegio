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
    return this.consulta.ejecutar(idSede);
  }

  @Post()
  async crear(
    @Param('idSede') idSede: string,
    @Body() solicitud: CrearPaginaSolicitud,
  ) {
    return this.crearPagina.ejecutar({
      sedeId: idSede,
      slug: solicitud.slug,
      titulo: solicitud.titulo,
    });
  }

  @Post(':idPagina/secciones')
  async agregar(
    @Param('idPagina') idPagina: string,
    @Body() solicitud: AgregarSeccionPaginaSolicitud,
  ) {
    return this.agregarSeccion.ejecutar({
      paginaSedeId: idPagina,
      tipoSeccion: solicitud.tipoSeccion,
      contenido: solicitud.contenido ?? {},
      orden: solicitud.orden ?? 0,
    });
  }

  @Post(':idPagina/publicar')
  publicar(@Param('idPagina') idPagina: string) {
    return this.publicarPagina.ejecutar(idPagina);
  }

  @Post(':idPagina/archivar')
  archivar(@Param('idPagina') idPagina: string) {
    return this.archivarPagina.ejecutar(idPagina);
  }

  @Post(':idPagina/restaurar')
  restaurar(@Param('idPagina') idPagina: string) {
    return this.restaurarPagina.ejecutar(idPagina);
  }

  @Patch(':idPagina/secciones/:idSeccion')
  cambiarSeccion(@Param('idSeccion') idSeccion: string) {
    return this.cambiarEstadoSeccion.ejecutar(idSeccion);
  }

  @Get(':slugPagina')
  obtenerPagina(
    @Param('idSede') idSede: string,
    @Param('slugPagina') slugPagina: string,
  ) {
    return this.obtener.ejecutar(idSede, slugPagina);
  }
}
