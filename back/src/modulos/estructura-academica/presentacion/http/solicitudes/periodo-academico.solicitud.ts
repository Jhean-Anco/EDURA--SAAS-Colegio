import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import {
  EstadoCalendario,
  TipoPeriodo,
} from '../../../dominio/puertos/estructura-academica.puerto';

export class CrearPeriodoAcademicoSolicitud {
  @IsUUID()
  @IsOptional()
  idAnioAcademico?: string;

  @IsString()
  @Length(1, 30)
  codigo!: string;

  @IsString()
  @Length(1, 100)
  nombre!: string;

  @IsEnum(['BIMESTRE', 'TRIMESTRE', 'SEMESTRE', 'CUATRIMESTRE', 'OTRO'])
  tipo!: TipoPeriodo;

  @IsInt()
  @Min(1)
  orden!: number;

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsOptional()
  @IsString()
  observacion?: string | null;
}

export class ActualizarPeriodoAcademicoSolicitud {
  @IsOptional()
  @IsString()
  @Length(1, 30)
  codigo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  nombre?: string;

  @IsOptional()
  @IsEnum(['BIMESTRE', 'TRIMESTRE', 'SEMESTRE', 'CUATRIMESTRE', 'OTRO'])
  tipo?: TipoPeriodo;

  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  observacion?: string | null;
}

export class CambiarEstadoPeriodoSolicitud {
  @IsEnum(['PLANIFICADO', 'ACTIVO', 'CERRADO', 'ANULADO'])
  estado!: EstadoCalendario;
}
