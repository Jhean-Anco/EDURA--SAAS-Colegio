export type EstadoAnioAcademico =
  | 'PLANIFICADO'
  | 'EN_CURSO'
  | 'CERRADO'
  | 'ANULADO';

export interface AnioAcademico {
  id: string;
  institucionId: string;
  nombre: string;
  anio: number;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoAnioAcademico;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
