export interface PaginaSalida {
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
