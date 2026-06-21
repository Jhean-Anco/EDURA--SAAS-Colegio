import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { EstadoNivel } from '../../../dominio/puertos/estructura-academica.puerto';

export class CrearGradoEducativoSolicitud {
  @IsUUID()
  idNivelEducativo!: string;

  @IsString()
  @Length(1, 30)
  codigo!: string;

  @IsString()
  @Length(1, 100)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @IsInt()
  @Min(0)
  orden!: number;
}

export class ActualizarGradoEducativoSolicitud {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsEnum(['ACTIVO', 'INACTIVO'])
  estado?: EstadoNivel;
}
