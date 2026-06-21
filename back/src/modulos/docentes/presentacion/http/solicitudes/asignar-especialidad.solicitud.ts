import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class AsignarEspecialidadSolicitud {
  @IsUUID()
  idEspecialidad!: string;

  @IsBoolean()
  esPrincipal!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  aniosExperiencia?: number | null;
}
