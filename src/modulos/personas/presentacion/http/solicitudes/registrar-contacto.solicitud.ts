import { IsBoolean, IsIn, IsOptional, IsString, Length } from 'class-validator';

const TIPOS = ['CORREO', 'CELULAR', 'TELEFONO', 'OTRO'] as const;

export class RegistrarContactoSolicitud {
  @IsIn(TIPOS)
  tipo!: 'CORREO' | 'CELULAR' | 'TELEFONO' | 'OTRO';

  @IsString()
  @Length(1, 320)
  valor!: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}
