export type EstadoPeriodoAcademico =
  | 'PLANIFICADO'
  | 'EN_CURSO'
  | 'CERRADO'
  | 'ANULADO';

export type TipoPeriodoAcademico =
  | 'BIMESTRE'
  | 'TRIMESTRE'
  | 'SEMESTRE'
  | 'CUATRIMESTRE'
  | 'OTRO';

export interface PeriodoAcademico {
  id: string;
  anioAcademicoId: string;
  institucionId: string;
  nombre: string;
  tipo: TipoPeriodoAcademico;
  orden: number;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoPeriodoAcademico;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
