import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  IsUUID,
} from 'class-validator';

export class RegistrarDireccionSedeSolicitud {
  @ApiProperty({ minLength: 1, maxLength: 250 })
  @IsString()
  @Length(1, 250)
  direccionLinea!: string;

  @ApiPropertyOptional({ maxLength: 250 })
  @IsOptional()
  @IsString()
  @Length(0, 250)
  referencia?: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  idUbigeo?: string | null;

  @ApiPropertyOptional({ example: '-12.046374' })
  @IsOptional()
  @IsNumberString()
  latitud?: string | null;

  @ApiPropertyOptional({ example: '-77.042793' })
  @IsOptional()
  @IsNumberString()
  longitud?: string | null;

  @ApiPropertyOptional({ maxLength: 15 })
  @IsOptional()
  @IsString()
  @Length(0, 15)
  codigoPostal?: string | null;
}
