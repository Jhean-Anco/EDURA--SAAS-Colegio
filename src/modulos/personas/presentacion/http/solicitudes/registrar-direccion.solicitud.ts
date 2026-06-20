import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class RegistrarDireccionSolicitud {
  @IsString()
  @Length(1, 250)
  direccionLinea!: string;

  @IsOptional()
  @IsString()
  @Length(1, 250)
  referencia?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;

  @IsOptional()
  @IsUUID()
  ubigeoId?: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}
