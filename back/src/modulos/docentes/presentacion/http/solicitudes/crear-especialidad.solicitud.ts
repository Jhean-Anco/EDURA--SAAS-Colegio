import { IsOptional, IsString, Length } from 'class-validator';

export class CrearEspecialidadSolicitud {
  @IsString()
  @Length(1, 40)
  codigo!: string;

  @IsString()
  @Length(1, 150)
  nombre!: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  descripcion?: string | null;
}
