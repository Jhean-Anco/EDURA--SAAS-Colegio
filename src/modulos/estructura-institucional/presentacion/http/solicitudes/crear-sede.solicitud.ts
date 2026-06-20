import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, Length } from 'class-validator';

export class CrearSedeSolicitud {
  @ApiProperty({ minLength: 1, maxLength: 30 })
  @IsString()
  @Length(1, 30)
  codigo!: string;

  @ApiProperty({ minLength: 1, maxLength: 150 })
  @IsString()
  @Length(1, 150)
  nombre!: string;

  @ApiProperty()
  @IsBoolean()
  institucionActiva!: boolean;
}
