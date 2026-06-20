import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { RepositorioPaginas } from '../../dominio/paginas/repositorio-paginas.puerto';
import { PaginaSalida } from './contratos/pagina.salida';
import { SeccionPaginaSalida } from './contratos/seccion-pagina.salida';

interface ConsultadorPaginasAplicacion {
  listarPorSede(sedeId: string): Promise<PaginaSalida[]>;
  obtenerPorSlug(sedeId: string, slug: string): Promise<PaginaSalida | null>;
}

export interface CrearPaginaEntrada {
  sedeId: string;
  slug: string;
  titulo: string;
}

export class CrearPaginaSedeCasoUso {
  constructor(private readonly repositorio: RepositorioPaginas) {}

  ejecutar(entrada: CrearPaginaEntrada): Promise<PaginaSalida> {
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

  ejecutar(sedeId: string): Promise<PaginaSalida[]> {
    return this.consultador.listarPorSede(sedeId);
  }
}

export class ObtenerPaginaSedeConsulta {
  constructor(private readonly consultador: ConsultadorPaginasAplicacion) {}

  ejecutar(sedeId: string, slug: string): Promise<PaginaSalida | null> {
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

  async ejecutar(
    entrada: AgregarSeccionPaginaEntrada,
    idPagina: string,
    idSede: string,
  ): Promise<SeccionPaginaSalida> {
    const pagina = await this.repositorio.buscarPorIdYSede(idPagina, idSede);
    if (!pagina) {
      throw new RecursoNoEncontradoError('La pagina solicitada no existe.');
    }
    return this.repositorio.agregarSeccion(idPagina, idSede, {
      paginaSedeId: idPagina,
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

  ejecutar(id: string, sedeId: string): Promise<PaginaSalida | null> {
    return this.repositorio.publicar(id, sedeId);
  }
}

export class ArchivarPaginaCasoUso {
  constructor(private readonly repositorio: RepositorioPaginas) {}

  ejecutar(id: string, sedeId: string): Promise<PaginaSalida | null> {
    return this.repositorio.archivar(id, sedeId);
  }
}

export class RestaurarPaginaCasoUso {
  constructor(private readonly repositorio: RepositorioPaginas) {}

  ejecutar(id: string, sedeId: string): Promise<PaginaSalida | null> {
    return this.repositorio.restaurar(id, sedeId);
  }
}

export class CambiarEstadoSeccionCasoUso {
  constructor(private readonly repositorio: RepositorioPaginas) {}

  ejecutar(
    idSeccion: string,
    idPagina: string,
    sedeId: string,
  ): Promise<SeccionPaginaSalida | null> {
    return this.repositorio.publicarSeccion(idSeccion, idPagina, sedeId);
  }
}
