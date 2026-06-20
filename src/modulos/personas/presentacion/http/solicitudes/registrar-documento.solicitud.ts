import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class RegistrarDocumentoSolicitud {
  @IsUUID()
  tipoDocumentoId!: string;

  @IsString()
  @Length(1, 80)
  numero!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  codigoPaisEmision?: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;

  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;
}
