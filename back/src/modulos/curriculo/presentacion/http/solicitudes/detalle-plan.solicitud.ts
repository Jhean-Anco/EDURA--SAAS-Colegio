import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ESTADOS_DETALLE,
  EstadoDetalle,
  TIPOS_DETALLE,
  TipoDetalle,
} from '../../../dominio/curriculo.constantes';

export class AgregarDetallePlanSolicitud {
  @IsUUID()
  idAsignatura!: string;

  @IsIn(TIPOS_DETALLE)
  tipo!: TipoDetalle;

  @IsInt()
  @Min(1)
  horasSemanales!: number;

  @IsInt()
  @Min(1)
  horasAnuales!: number;

  @IsInt()
  @Min(1)
  orden!: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  observacion?: string | null;
}

export class ActualizarDetallePlanSolicitud {
  @IsOptional()
  @IsIn(TIPOS_DETALLE)
  tipo?: TipoDetalle;

  @IsOptional()
  @IsInt()
  @Min(1)
  horasSemanales?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  horasAnuales?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  observacion?: string | null;
}

export class CambiarEstadoDetalleSolicitud {
  @IsIn(ESTADOS_DETALLE)
  estado!: EstadoDetalle;
}
