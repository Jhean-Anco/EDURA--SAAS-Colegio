import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

function convertirEntero(valor: unknown): number {
  if (typeof valor === 'number' && Number.isInteger(valor)) {
    return valor;
  }
  if (typeof valor === 'string' && /^-?\d+$/.test(valor)) {
    return Number(valor);
  }
  return Number.NaN;
}

export class ConsultaPaginadaSolicitud {
  @Transform(({ value }) => convertirEntero(value))
  @IsInt()
  @Min(1)
  pagina = 1;

  @Transform(({ value }) => convertirEntero(value))
  @IsInt()
  @Min(1)
  @Max(100)
  tamano = 20;
}
