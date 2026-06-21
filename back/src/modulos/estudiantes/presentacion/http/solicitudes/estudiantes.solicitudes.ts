import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ListarEstudiantesSolicitud {
  @IsOptional()
  @IsUUID()
  idSede?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  busqueda?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number;
}

export class CrearEstudianteSolicitud {
  @IsUUID()
  idPersona!: string;

  @IsUUID()
  idSede!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  codigo!: string;

  @IsOptional()
  @IsISO8601()
  fechaIngreso?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  observacion?: string;
}

export class ActualizarEstudianteSolicitud {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  codigo?: string;

  @IsOptional()
  @IsUUID()
  idSede?: string;

  @IsOptional()
  @IsISO8601()
  fechaIngreso?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  observacion?: string | null;
}

export class CambiarEstadoEstudianteSolicitud {
  @IsString()
  estado!: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' | 'TRASLADADO' | 'EGRESADO';
}

export class AgregarApoderadoEstudianteSolicitud {
  @IsUUID()
  idPersona!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  parentesco!: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;

  @IsOptional()
  @IsBoolean()
  puedeRecoger?: boolean;

  @IsOptional()
  @IsBoolean()
  recibeComunicaciones?: boolean;
}

export class ActualizarApoderadoEstudianteSolicitud {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  parentesco?: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;

  @IsOptional()
  @IsBoolean()
  puedeRecoger?: boolean;

  @IsOptional()
  @IsBoolean()
  recibeComunicaciones?: boolean;

  @IsOptional()
  @IsString()
  estado?: string;
}

export class RegistrarDocumentoEstudianteSolicitud {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  tipoDocumento!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  nombre!: string;

  @IsOptional()
  @IsISO8601()
  fechaEmision?: string;

  @IsOptional()
  @IsISO8601()
  fechaVencimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  observacion?: string;
}
