import { IsOptional, IsString } from 'class-validator';

export class ResumenPanelInstitucionalSolicitud {
  @IsOptional()
  @IsString()
  idSede?: string;

  @IsOptional()
  @IsString()
  idPeriodoAcademico?: string;
}
