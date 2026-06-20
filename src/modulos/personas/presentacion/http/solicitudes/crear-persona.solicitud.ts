import { IsOptional, IsString, Length } from 'class-validator';

export class CrearPersonaSolicitud {
  @IsString()
  @Length(1, 150)
  nombres!: string;

  @IsString()
  institucionEducativaId!: string;

  @IsOptional()
  @IsString()
  apellidoPaterno?: string | null;
}
