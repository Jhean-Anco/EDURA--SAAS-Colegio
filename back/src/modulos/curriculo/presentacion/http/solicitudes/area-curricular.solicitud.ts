import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ESTADOS_AREA,
  EstadoArea,
} from '../../../dominio/curriculo.constantes';

export class CrearAreaCurricularSolicitud {
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
  descripcion?: string | null;

  @IsInt()
  @Min(1)
  orden!: number;
}

export class ActualizarAreaCurricularSolicitud {
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
  descripcion?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number;
}

export class CambiarEstadoAreaSolicitud {
  @IsIn(ESTADOS_AREA)
  estado!: EstadoArea;
}
