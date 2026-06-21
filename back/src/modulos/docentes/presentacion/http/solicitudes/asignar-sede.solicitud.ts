import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class AsignarSedeSolicitud {
  @IsUUID()
  idSede!: string;

  @IsBoolean()
  esPrincipal!: boolean;

  @IsDateString()
  fechaInicio!: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  observacion?: string | null;
}
