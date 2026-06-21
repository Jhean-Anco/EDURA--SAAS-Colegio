import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CrearMatriculaBorradorSolicitud {
  @IsUUID()
  idSede!: string;

  @IsUUID()
  idEstudiante!: string;

  @IsUUID()
  idAnioAcademico!: string;

  @IsUUID()
  idNivelEducativo!: string;

  @IsUUID()
  idGradoEducativo!: string;

  @IsUUID()
  idOfertaGradoSede!: string;

  @IsUUID()
  @IsOptional()
  idSeccionAcademica?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  codigoMatricula!: string;

  @IsDateString()
  fechaMatricula!: string;

  @IsString()
  @IsOptional()
  observacion?: string | null;
}
