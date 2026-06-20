import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { validarSedeDelContexto } from '../../../../../compartido/presentacion/http/validacion-contexto-http';
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

  @Permisos('SEDES.LEER')
  @Get()
  async listar(
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<PaginaRespuesta[]> {
    validarSedeDelContexto(ctx, ctx?.institucionId ?? '', idSede);
    const paginas = await this.consulta.ejecutar(idSede);
    return paginas.map((pagina) => this.mapearPagina(pagina));
  }

  @Permisos('SEDES.ACTUALIZAR')
  @Post()
  async crear(
    @Param('idSede') idSede: string,
    @Body() solicitud: CrearPaginaSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<PaginaRespuesta> {
    validarSedeDelContexto(ctx, ctx?.institucionId ?? '', idSede);
    return this.mapearPagina(
      await this.crearPagina.ejecutar({
        sedeId: idSede,
        slug: solicitud.slug,
        titulo: solicitud.titulo,
      }),
    );
  }

  @Permisos('SEDES.ACTUALIZAR')
  @Post(':idPagina/secciones')
  async agregar(
    @Param('idPagina') idPagina: string,
    @Body() solicitud: AgregarSeccionPaginaSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<SeccionPaginaSalida> {
    void ctx;
    return this.agregarSeccion.ejecutar({
      paginaSedeId: idPagina,
      tipoSeccion: solicitud.tipoSeccion,
      contenido: solicitud.contenido ?? {},
      orden: solicitud.orden ?? 0,
    });
  }

  @Permisos('SEDES.ACTUALIZAR')
  @Post(':idPagina/publicar')
  async publicar(
    @Param('idPagina') idPagina: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<PaginaRespuesta | null> {
    void ctx;
    const pagina = await this.publicarPagina.ejecutar(idPagina);
    return pagina ? this.mapearPagina(pagina) : null;
  }

  @Permisos('SEDES.ACTUALIZAR')
  @Post(':idPagina/archivar')
  async archivar(
    @Param('idPagina') idPagina: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<PaginaRespuesta | null> {
    void ctx;
    const pagina = await this.archivarPagina.ejecutar(idPagina);
    return pagina ? this.mapearPagina(pagina) : null;
  }

  @Permisos('SEDES.ACTUALIZAR')
  @Post(':idPagina/restaurar')
  async restaurar(
    @Param('idPagina') idPagina: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<PaginaRespuesta | null> {
    void ctx;
    const pagina = await this.restaurarPagina.ejecutar(idPagina);
    return pagina ? this.mapearPagina(pagina) : null;
  }

  @Permisos('SEDES.ACTUALIZAR')
  @Patch(':idPagina/secciones/:idSeccion')
  async cambiarSeccion(
    @Param('idSeccion') idSeccion: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<SeccionPaginaSalida | null> {
    void ctx;
    return this.cambiarEstadoSeccion.ejecutar(idSeccion);
  }

  @Permisos('SEDES.LEER')
  @Get(':slugPagina')
  async obtenerPagina(
    @Param('idSede') idSede: string,
    @Param('slugPagina') slugPagina: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<PaginaRespuesta | null> {
    validarSedeDelContexto(ctx, ctx?.institucionId ?? '', idSede);
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
