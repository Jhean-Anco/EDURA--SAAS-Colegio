import { RepositorioPaginas } from '../../dominio/paginas/repositorio-paginas.puerto';
import { PaginaRespuesta } from '../../presentacion/http/respuestas/pagina.respuesta';

interface ConsultadorPaginasAplicacion {
  listarPorSede(sedeId: string): Promise<PaginaRespuesta[]>;
  obtenerPorSlug(sedeId: string, slug: string): Promise<PaginaRespuesta | null>;
}

export interface CrearPaginaEntrada {
  sedeId: string;
  slug: string;
  titulo: string;
}

export class CrearPaginaSedeCasoUso {
  constructor(private readonly repositorio: RepositorioPaginas) {}

  ejecutar(entrada: CrearPaginaEntrada): Promise<PaginaRespuesta> {
    return this.repositorio.crear({
      sedeId: entrada.sedeId,
      slug: entrada.slug,
      titulo: entrada.titulo,
      resumen: null,
      descripcionSeo: null,
      esPaginaInicio: false,
      visibleEnMenu: true,
      ordenMenu: 0,
      estado: 'BORRADOR',
      fechaPublicacion: null,
      version: 1,
    });
  }
}

export class ListarPaginasSedeConsulta {
  constructor(private readonly consultador: ConsultadorPaginasAplicacion) {}

  ejecutar(sedeId: string): Promise<PaginaRespuesta[]> {
    return this.consultador.listarPorSede(sedeId);
  }
}

export class ObtenerPaginaSedeConsulta {
  constructor(private readonly consultador: ConsultadorPaginasAplicacion) {}

  ejecutar(sedeId: string, slug: string): Promise<PaginaRespuesta | null> {
    return this.consultador.obtenerPorSlug(sedeId, slug);
  }
}

export interface AgregarSeccionPaginaEntrada {
  paginaSedeId: string;
  tipoSeccion: string;
  contenido: Record<string, unknown>;
  orden: number;
}

export class AgregarSeccionPaginaCasoUso {
  constructor(private readonly repositorio: RepositorioPaginas) {}

  ejecutar(entrada: AgregarSeccionPaginaEntrada) {
    return this.repositorio.agregarSeccion({
      paginaSedeId: entrada.paginaSedeId,
      tipoSeccion: entrada.tipoSeccion,
      contenido: entrada.contenido,
      orden: entrada.orden,
      visible: true,
      estado: 'ACTIVA',
      titulo: null,
      version: 1,
    });
  }
}

export class PublicarPaginaCasoUso {
  constructor(private readonly repositorio: RepositorioPaginas) {}

  ejecutar(id: string) {
    return this.repositorio.publicar(id);
  }
}

export class ArchivarPaginaCasoUso {
  constructor(private readonly repositorio: RepositorioPaginas) {}

  ejecutar(id: string) {
    return this.repositorio.archivar(id);
  }
}

export class RestaurarPaginaCasoUso {
  constructor(private readonly repositorio: RepositorioPaginas) {}

  ejecutar(id: string) {
    return this.repositorio.restaurar(id);
  }
}

export class CambiarEstadoSeccionCasoUso {
  constructor(private readonly repositorio: RepositorioPaginas) {}

  ejecutar(id: string) {
    return this.repositorio.publicarSeccion(id);
  }
}
