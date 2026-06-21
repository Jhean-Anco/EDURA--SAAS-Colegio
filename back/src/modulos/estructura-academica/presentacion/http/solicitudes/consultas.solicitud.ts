import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsIn,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  ESTADOS_CALENDARIO,
  ESTADOS_NIVEL,
  ESTADOS_OFERTA,
  ESTADOS_SECCION,
  EstadoCalendario,
  EstadoNivel,
  EstadoOferta,
  EstadoSeccion,
} from '../../../dominio/estructura-academica.constantes';

export class PaginacionQueryDto {
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

export class ListarAniosQueryDto extends PaginacionQueryDto {
  @IsOptional()
  @IsIn(ESTADOS_CALENDARIO)
  estado?: EstadoCalendario;
}

export class ListarPeriodosQueryDto extends PaginacionQueryDto {
  @IsOptional()
  @IsIn(ESTADOS_CALENDARIO)
  estado?: EstadoCalendario;
}

export class ListarNivelesQueryDto extends PaginacionQueryDto {
  @IsOptional()
  @IsIn(ESTADOS_NIVEL)
  estado?: EstadoNivel;
}

export class ListarGradosQueryDto extends PaginacionQueryDto {
  @IsOptional()
  @IsUUID()
  idNivel?: string;

  @IsOptional()
  @IsIn(ESTADOS_NIVEL)
  estado?: EstadoNivel;
}

export class ListarOfertasQueryDto extends PaginacionQueryDto {
  @IsOptional()
  @IsUUID()
  idSede?: string;

  @IsOptional()
  @IsUUID()
  idAnio?: string;

  @IsOptional()
  @IsIn(ESTADOS_OFERTA)
  estado?: EstadoOferta;
}

export class ListarSeccionesQueryDto extends PaginacionQueryDto {
  @IsOptional()
  @IsIn(ESTADOS_SECCION)
  estado?: EstadoSeccion;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  busqueda?: string;
}
