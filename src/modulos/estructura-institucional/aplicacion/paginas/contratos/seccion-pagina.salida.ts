export interface SeccionPaginaSalida {
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
