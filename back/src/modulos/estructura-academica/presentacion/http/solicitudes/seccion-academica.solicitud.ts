import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ESTADOS_SECCION,
  TURNOS_SECCION,
  EstadoSeccion,
  TurnoSeccion,
} from '../../../dominio/estructura-academica.constantes';

export class CrearSeccionAcademicaSolicitud {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 30)
  codigo!: string;

  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 50)
  nombre!: string;

  @IsIn(TURNOS_SECCION)
  turno!: TurnoSeccion;

  @IsOptional()
  @IsInt()
  @IsPositive()
  capacidadMaxima?: number | null;

  @IsOptional()
  @IsUUID()
  idDocenteTutor?: string | null;

  @IsOptional()
  @IsUUID()
  idEspacioFisico?: string | null;
}

export class ActualizarSeccionAcademicaSolicitud {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 30)
  codigo?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 50)
  nombre?: string;

  @IsOptional()
  @IsIn(TURNOS_SECCION)
  turno?: TurnoSeccion;

  @IsOptional()
  @IsInt()
  @IsPositive()
  capacidadMaxima?: number | null;
}

export class CambiarEstadoSeccionSolicitud {
  @IsIn(ESTADOS_SECCION)
  estado!: EstadoSeccion;
}

export class AsignarEspacioSeccionSolicitud {
  @IsOptional()
  @IsUUID()
  idEspacioFisico?: string | null;
}

export class AsignarTutorSeccionSolicitud {
  @IsOptional()
  @IsUUID()
  idDocenteTutor?: string | null;
}
