import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsOptional } from 'class-validator';

export class IniciarSesionSolicitud {
  @ApiPropertyOptional()
  @IsString()
  @Length(1, 320)
  @IsOptional()
  correo?: string;

  @ApiPropertyOptional()
  @IsString()
  @Length(1, 200)
  @IsOptional()
  clave?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;
}
