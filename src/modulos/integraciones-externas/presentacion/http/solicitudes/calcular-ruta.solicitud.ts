import { Type } from 'class-transformer';
import { IsNumber, IsObject, Max, Min, ValidateNested } from 'class-validator';

class PuntoGeograficoSolicitud {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud!: number;
}

export class CalcularRutaSolicitud {
  @IsObject()
  @ValidateNested()
  @Type(() => PuntoGeograficoSolicitud)
  origen!: PuntoGeograficoSolicitud;

  @IsObject()
  @ValidateNested()
  @Type(() => PuntoGeograficoSolicitud)
  destino!: PuntoGeograficoSolicitud;
}
