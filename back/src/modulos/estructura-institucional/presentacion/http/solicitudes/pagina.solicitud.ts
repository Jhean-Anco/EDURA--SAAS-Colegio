import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, Length, Min } from 'class-validator';

export class CrearPaginaSolicitud {
  @ApiProperty({ minLength: 1, maxLength: 120 })
  @IsString()
  @Length(1, 120)
  slug!: string;

  @ApiProperty({ minLength: 1, maxLength: 180 })
  @IsString()
  @Length(1, 180)
  titulo!: string;
}

export class AgregarSeccionPaginaSolicitud {
  @ApiProperty({ minLength: 1, maxLength: 30 })
  @IsString()
  @Length(1, 30)
  tipoSeccion!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  contenido?: Record<string, unknown>;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Min(0)
  orden?: number;
}
