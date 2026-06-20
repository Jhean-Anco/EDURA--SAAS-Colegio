import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RegistrarServicioBasicoSedeSolicitud {
  @IsString()
  @MaxLength(40)
  tipoServicioCodigo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  proveedor?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroSuministro?: string | null;
}
