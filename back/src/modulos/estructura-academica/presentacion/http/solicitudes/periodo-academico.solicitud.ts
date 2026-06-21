import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ESTADOS_CALENDARIO,
  TIPOS_PERIODO,
  EstadoCalendario,
  TipoPeriodo,
} from '../../../dominio/estructura-academica.constantes';

export class CrearPeriodoAcademicoSolicitud {
  @IsUUID()
  @IsOptional()
  idAnioAcademico?: string;

  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 30)
  codigo!: string;

  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 100)
  nombre!: string;

  @IsIn(TIPOS_PERIODO)
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
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  observacion?: string | null;
}

export class ActualizarPeriodoAcademicoSolicitud {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 30)
  codigo?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 100)
  nombre?: string;

  @IsOptional()
  @IsIn(TIPOS_PERIODO)
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
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  observacion?: string | null;
}

export class CambiarEstadoPeriodoSolicitud {
  @IsIn(ESTADOS_CALENDARIO)
  estado!: EstadoCalendario;
}
