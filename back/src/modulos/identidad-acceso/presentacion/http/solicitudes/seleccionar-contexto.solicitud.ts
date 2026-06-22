import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class SeleccionarContextoSolicitud {
  @IsIn(['PLATAFORMA', 'INSTITUCION', 'SEDE'])
  ambito!: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';

  @IsString()
  @IsOptional()
  rolCodigo?: string;

  @IsUUID()
  rolId!: string;

  @IsUUID()
  @IsOptional()
  institucionId!: string | null;

  @IsUUID()
  @IsOptional()
  sedeId!: string | null;

  @IsString()
  @IsOptional()
  institucionNombre!: string | null;

  @IsString()
  @IsOptional()
  sedeNombre!: string | null;
}
