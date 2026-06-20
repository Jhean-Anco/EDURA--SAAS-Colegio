import { IsString, Length, Matches } from 'class-validator';

export class ConsultarDniSolicitud {
  @IsString()
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 caracteres' })
  @Matches(/^\d{8}$/, { message: 'El DNI debe contener solo dígitos' })
  numeroDni!: string;
}
