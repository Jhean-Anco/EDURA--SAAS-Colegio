import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class ActualizarDocenteSolicitud {
  @IsOptional()
  @IsString()
  @Length(1, 40)
  codigo?: string;

  @IsOptional()
  @IsDateString()
  fechaIngreso?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  perfilProfesional?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  observacion?: string | null;
}
