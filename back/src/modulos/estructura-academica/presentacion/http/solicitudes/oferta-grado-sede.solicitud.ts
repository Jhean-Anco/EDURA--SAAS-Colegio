import { IsEnum, IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { EstadoOferta } from '../../../dominio/puertos/estructura-academica.puerto';

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

  @IsOptional()
  @IsEnum(['PLANIFICADA', 'ACTIVA', 'CERRADA', 'CANCELADA'])
  estado?: EstadoOferta;
}
