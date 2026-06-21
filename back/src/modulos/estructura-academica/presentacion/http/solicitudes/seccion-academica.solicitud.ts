import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { EstadoSeccion } from '../../../dominio/puertos/estructura-academica.puerto';

export class CrearSeccionAcademicaSolicitud {
  @IsString()
  @Length(1, 30)
  codigo!: string;

  @IsString()
  @Length(1, 50)
  nombre!: string;

  @IsEnum(['MANANA', 'TARDE', 'NOCHE'])
  turno!: string;

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
  @Length(1, 30)
  codigo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  nombre?: string;

  @IsOptional()
  @IsEnum(['MANANA', 'TARDE', 'NOCHE'])
  turno?: string;

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

  @IsOptional()
  @IsEnum(['ACTIVA', 'INACTIVA'])
  estado?: EstadoSeccion;
}
