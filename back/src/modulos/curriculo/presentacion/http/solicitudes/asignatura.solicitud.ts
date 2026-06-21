import {
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
  ESTADOS_ASIGNATURA,
  EstadoAsignatura,
} from '../../../dominio/curriculo.constantes';

export class CrearAsignaturaSolicitud {
  @IsUUID()
  idAreaCurricular!: string;

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
  @Length(1, 150)
  nombre!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 60)
  nombreCorto?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  descripcion?: string | null;

  @IsInt()
  @Min(1)
  orden!: number;
}

export class ActualizarAsignaturaSolicitud {
  @IsOptional()
  @IsUUID()
  idAreaCurricular?: string;

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
  @Length(1, 150)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 60)
  nombreCorto?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  descripcion?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number;
}

export class CambiarEstadoAsignaturaSolicitud {
  @IsIn(ESTADOS_ASIGNATURA)
  estado!: EstadoAsignatura;
}
