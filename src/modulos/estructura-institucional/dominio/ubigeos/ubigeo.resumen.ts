export interface UbigeoResumen {
  id: string;
  codigo: string;
  nombre: string;
  nivel: string;
  estado: 'ACTIVO' | 'INACTIVO';
  idUbigeoPadre: string | null;
}
