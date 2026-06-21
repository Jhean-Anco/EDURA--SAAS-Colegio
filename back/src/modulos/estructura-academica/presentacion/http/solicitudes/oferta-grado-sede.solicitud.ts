import { IsInt, IsOptional, IsPositive, IsUUID, IsIn } from 'class-validator';
import {
  ESTADOS_OFERTA,
  EstadoOferta,
} from '../../../dominio/estructura-academica.constantes';

export class CrearOfertaGradoSedeSolicitud {
  @IsUUID()
  idSede!: string;

  @IsUUID()
  idGradoEducativo!: string;

  @IsUUID()
  idAnioAcademico!: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  capacidadReferencial?: number | null;
}

export class ActualizarOfertaGradoSedeSolicitud {
  @IsOptional()
  @IsInt()
  @IsPositive()
  capacidadReferencial?: number | null;
}

export class CambiarEstadoOfertaSolicitud {
  @IsIn(ESTADOS_OFERTA)
  estado!: EstadoOferta;
}
