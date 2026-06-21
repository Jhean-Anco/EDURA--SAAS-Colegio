import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class CambiarEstadoDocenteSolicitud {
  @IsIn(['ACTIVO', 'INACTIVO', 'CESADO'])
  estado!: string;

  @IsOptional()
  @IsDateString()
  fechaCese?: string | null;
}
