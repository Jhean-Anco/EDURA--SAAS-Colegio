import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CrearInstitucionSolicitud {
  @ApiProperty({ minLength: 1, maxLength: 30 })
  @IsString()
  @Length(1, 30)
  codigo!: string;

  @ApiProperty({ minLength: 1, maxLength: 200 })
  @IsString()
  @Length(1, 200)
  nombreLegal!: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  nombreCorto?: string | null;

  @ApiPropertyOptional({ maxLength: 30 })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  tipoGestion?: string | null;
}
