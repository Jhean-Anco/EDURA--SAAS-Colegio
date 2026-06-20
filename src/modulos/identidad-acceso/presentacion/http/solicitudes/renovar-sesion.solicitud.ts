import { IsString, MinLength } from 'class-validator';

export class RenovarSesionSolicitud {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
