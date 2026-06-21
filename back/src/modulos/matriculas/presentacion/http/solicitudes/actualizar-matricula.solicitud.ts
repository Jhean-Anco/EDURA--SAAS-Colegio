import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class ActualizarMatriculaBorradorSolicitud {
  @IsUUID()
  @IsOptional()
  idSede?: string;

  @IsUUID()
  @IsOptional()
  idEstudiante?: string;

  @IsUUID()
  @IsOptional()
  idAnioAcademico?: string;

  @IsUUID()
  @IsOptional()
  idNivelEducativo?: string;

  @IsUUID()
  @IsOptional()
  idGradoEducativo?: string;

  @IsUUID()
  @IsOptional()
  idOfertaGradoSede?: string;

  @IsUUID()
  @IsOptional()
  idSeccionAcademica?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @IsOptional()
  codigoMatricula?: string;

  @IsDateString()
  @IsOptional()
  fechaMatricula?: string;

  @IsString()
  @IsOptional()
  observacion?: string | null;
}
