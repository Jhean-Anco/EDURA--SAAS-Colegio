import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class IniciarSesionSolicitud {
  @ApiProperty()
  @IsString()
  @Length(1, 320)
  correo!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  clave!: string;
}
