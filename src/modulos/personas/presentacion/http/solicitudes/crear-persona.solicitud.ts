import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CrearPersonaSolicitud {
  @IsString()
  @Length(1, 150)
  nombres!: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  apellidoPaterno?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  apellidoMaterno?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsIn(['MASCULINO', 'FEMENINO', 'OTRO'])
  sexoRegistral?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  codigoPaisNacionalidad?: string;
}
