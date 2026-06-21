import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CrearDocenteSolicitud {
  @IsUUID()
  idPersona!: string;

  @IsUUID()
  idSede!: string;

  @IsString()
  @Length(1, 40)
  codigo!: string;

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
