import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class ActualizarAsignacionEspecialidadSolicitud {
  @IsOptional()
  @IsInt()
  @Min(0)
  aniosExperiencia?: number | null;

  @IsOptional()
  @IsIn(['ACTIVA', 'INACTIVA'])
  estado?: string;
}
