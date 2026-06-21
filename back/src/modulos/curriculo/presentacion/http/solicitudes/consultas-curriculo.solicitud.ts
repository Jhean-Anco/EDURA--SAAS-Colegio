import { IsOptional, IsString, IsUUID, IsIn } from 'class-validator';
import {
  ESTADOS_AREA,
  EstadoArea,
  ESTADOS_ASIGNATURA,
  EstadoAsignatura,
  ESTADOS_PLAN,
  EstadoPlan,
} from '../../../dominio/curriculo.constantes';

export class ListarAreasQueryDto {
  @IsOptional()
  @IsIn(ESTADOS_AREA)
  estado?: EstadoArea;
}

export class ListarAsignaturasQueryDto {
  @IsOptional()
  @IsUUID()
  idArea?: string;

  @IsOptional()
  @IsIn(ESTADOS_ASIGNATURA)
  estado?: EstadoAsignatura;
}

export class ListarPlanesQueryDto {
  @IsOptional()
  @IsUUID()
  idAnio?: string;

  @IsOptional()
  @IsUUID()
  idGrado?: string;

  @IsOptional()
  @IsIn(ESTADOS_PLAN)
  estado?: EstadoPlan;
}

export class ResolverPlanQueryDto {
  @IsUUID()
  idAnio!: string;

  @IsUUID()
  idGrado!: string;
}
