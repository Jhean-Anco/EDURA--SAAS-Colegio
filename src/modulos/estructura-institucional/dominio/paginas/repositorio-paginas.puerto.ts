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
    seccion: Partial<SeccionPaginaSedeResumenPersistencia>,
  ): Promise<SeccionPaginaSedeResumenPersistencia>;
  publicar(id: string): Promise<PaginaSedeResumenPersistencia | null>;
  archivar(id: string): Promise<PaginaSedeResumenPersistencia | null>;
  restaurar(id: string): Promise<PaginaSedeResumenPersistencia | null>;
  publicarSeccion(
    id: string,
  ): Promise<SeccionPaginaSedeResumenPersistencia | null>;
}
