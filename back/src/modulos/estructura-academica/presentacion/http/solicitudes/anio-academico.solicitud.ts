import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { EstadoCalendario } from '../../../dominio/puertos/estructura-academica.puerto';

export class CrearAnioAcademicoSolicitud {
  @IsInt()
  @Min(2000)
  @Max(2100)
  anio!: number;

  @IsString()
  @Length(1, 30)
  codigo!: string;

  @IsString()
  @Length(1, 100)
  nombre!: string;

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsOptional()
  @IsEnum(['PLANIFICADO', 'ACTIVO'])
  estado?: EstadoCalendario;

  @IsOptional()
  @IsString()
  observacion?: string | null;
}

export class ActualizarAnioAcademicoSolicitud {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nombre?: string;

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

export class CambiarEstadoAnioSolicitud {
  @IsEnum(['PLANIFICADO', 'ACTIVO', 'CERRADO', 'ANULADO'])
  estado!: EstadoCalendario;
}
