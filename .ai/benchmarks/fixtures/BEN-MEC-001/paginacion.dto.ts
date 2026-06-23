// FIXTURE BEN-MEC-001 — Archivo con import inválido para benchmark
// Este archivo es SINTÉTICO para pruebas. No contiene datos reales.
// La ruta de import a continuación es intencionalmente inválida.

import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AlgoInexistente } from '../../../inexistente/ruta-que-no-existe'; // IMPORT INVÁLIDO

export class PaginacionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number = 10;
}
