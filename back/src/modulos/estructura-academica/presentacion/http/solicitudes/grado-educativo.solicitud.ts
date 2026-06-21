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
  ESTADOS_NIVEL,
  EstadoNivel,
} from '../../../dominio/estructura-academica.constantes';

export class CrearGradoEducativoSolicitud {
  @IsUUID()
  idNivelEducativo!: string;

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

export class ActualizarGradoEducativoSolicitud {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 100)
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

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 30)
  codigo?: string;
}

export class CambiarEstadoGradoSolicitud {
  @IsIn(ESTADOS_NIVEL)
  estado!: EstadoNivel;
}
