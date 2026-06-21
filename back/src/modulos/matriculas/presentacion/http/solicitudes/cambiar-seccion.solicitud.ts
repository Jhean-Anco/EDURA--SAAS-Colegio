import { IsUUID, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CambiarSeccionSolicitud {
  @IsUUID()
  idSeccionNueva!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivo!: string;
}
