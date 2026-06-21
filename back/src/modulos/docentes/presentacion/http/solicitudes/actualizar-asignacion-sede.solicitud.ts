import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ActualizarAsignacionSedeSolicitud {
  @IsOptional()
  @IsDateString()
  fechaFin?: string | null;

  @IsOptional()
  @IsIn(['ACTIVA', 'INACTIVA'])
  estado?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  observacion?: string | null;
}
