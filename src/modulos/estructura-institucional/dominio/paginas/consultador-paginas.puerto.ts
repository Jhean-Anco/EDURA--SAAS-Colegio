import { PaginaResumen } from './pagina.resumen';

export const CONSULTADOR_PAGINAS = Symbol('CONSULTADOR_PAGINAS');

export interface ConsultadorPaginas {
  listarPorSede(sedeId: string): Promise<PaginaResumen[]>;
  obtenerPorSlug(sedeId: string, slug: string): Promise<PaginaResumen | null>;
}
