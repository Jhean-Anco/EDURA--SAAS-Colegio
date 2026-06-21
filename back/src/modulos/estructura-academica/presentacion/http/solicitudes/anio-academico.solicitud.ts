import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ESTADOS_CALENDARIO,
  EstadoCalendario,
} from '../../../dominio/estructura-academica.constantes';

export class CrearAnioAcademicoSolicitud {
  @IsInt()
  @Min(2000)
  @Max(2100)
  anio!: number;

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

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsOptional()
  @IsIn(['PLANIFICADO', 'ACTIVO'])
  estado?: EstadoCalendario;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  observacion?: string | null;
}

export class ActualizarAnioAcademicoSolicitud {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
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
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  observacion?: string | null;
}

export class CambiarEstadoAnioSolicitud {
  @IsIn(ESTADOS_CALENDARIO)
  estado!: EstadoCalendario;
}
