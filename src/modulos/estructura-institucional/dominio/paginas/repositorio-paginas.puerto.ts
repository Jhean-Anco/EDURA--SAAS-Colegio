export interface PaginaSedeResumenPersistencia {
  id: string;
  sedeId: string;
  slug: string;
  titulo: string;
  resumen: string | null;
  descripcionSeo: string | null;
  esPaginaInicio: boolean;
  visibleEnMenu: boolean;
  ordenMenu: number;
  estado: string;
  fechaPublicacion: Date | null;
  version: number;
}

export interface SeccionPaginaSedeResumenPersistencia {
  id: string;
  paginaSedeId: string;
  tipoSeccion: string;
  titulo: string | null;
  contenido: Record<string, unknown>;
  orden: number;
  visible: boolean;
  estado: string;
  version: number;
}

export const REPOSITORIO_PAGINAS = Symbol('REPOSITORIO_PAGINAS');

export interface RepositorioPaginas {
  crear(
    pagina: Partial<PaginaSedeResumenPersistencia>,
  ): Promise<PaginaSedeResumenPersistencia>;
  agregarSeccion(
    paginaId: string,
    sedeId: string,
    seccion: Partial<SeccionPaginaSedeResumenPersistencia>,
  ): Promise<SeccionPaginaSedeResumenPersistencia>;
  publicar(
    id: string,
    sedeId: string,
  ): Promise<PaginaSedeResumenPersistencia | null>;
  archivar(
    id: string,
    sedeId: string,
  ): Promise<PaginaSedeResumenPersistencia | null>;
  restaurar(
    id: string,
    sedeId: string,
  ): Promise<PaginaSedeResumenPersistencia | null>;
  publicarSeccion(
    id: string,
    idPagina: string,
    sedeId: string,
  ): Promise<SeccionPaginaSedeResumenPersistencia | null>;
  buscarPorIdYSede(
    idPagina: string,
    sedeId: string,
  ): Promise<PaginaSedeResumenPersistencia | null>;
  buscarSeccionPorIdYPagina(
    idSeccion: string,
    idPagina: string,
    sedeId: string,
  ): Promise<SeccionPaginaSedeResumenPersistencia | null>;
}
