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
  ESTADOS_PLAN,
  EstadoPlan,
} from '../../../dominio/curriculo.constantes';

export class CrearPlanEstudioSolicitud {
  @IsUUID()
  idAnioAcademico!: string;

  @IsUUID()
  idGradoEducativo!: string;

  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 40)
  codigo!: string;

  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 180)
  nombre!: string;

  @IsInt()
  @Min(1)
  version!: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  observacion?: string | null;
}

export class ActualizarPlanEstudioSolicitud {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 40)
  codigo?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 180)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  observacion?: string | null;
}

export class CambiarEstadoPlanSolicitud {
  @IsIn(ESTADOS_PLAN)
  estado!: EstadoPlan;
}

export class DuplicarPlanEstudioSolicitud {
  @IsOptional()
  @IsUUID()
  idAnioAcademico?: string;

  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 40)
  codigo!: string;

  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 180)
  nombre!: string;

  @IsInt()
  @Min(1)
  version!: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  observacion?: string | null;
}
