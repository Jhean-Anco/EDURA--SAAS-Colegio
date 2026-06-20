import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

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
}
