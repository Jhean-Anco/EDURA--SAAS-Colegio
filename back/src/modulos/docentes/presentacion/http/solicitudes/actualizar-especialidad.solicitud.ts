import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class ActualizarEspecialidadSolicitud {
  @IsOptional()
  @IsString()
  @Length(1, 40)
  codigo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  descripcion?: string | null;

  @IsOptional()
  @IsIn(['ACTIVA', 'INACTIVA'])
  estado?: string;
}
