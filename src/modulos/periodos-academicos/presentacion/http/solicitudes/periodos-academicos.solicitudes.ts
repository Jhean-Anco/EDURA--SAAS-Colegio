import { TipoPeriodoAcademico } from '../../../dominio/entidades/periodo-academico';
import { EstadoAnioAcademico } from '../../../dominio/entidades/anio-academico';
import { EstadoPeriodoAcademico } from '../../../dominio/entidades/periodo-academico';

export interface CrearAnioAcademicoSolicitud {
  nombre: string;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface CambiarEstadoAnioSolicitud {
  estado: EstadoAnioAcademico;
}

export interface CrearPeriodoAcademicoSolicitud {
  nombre: string;
  tipo: TipoPeriodoAcademico;
  orden: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface CambiarEstadoPeriodoSolicitud {
  estado: EstadoPeriodoAcademico;
}
