import { IdentidadSedeResumen } from './identidad-sede.resumen';

export const CONSULTADOR_IDENTIDAD_SEDE = Symbol('CONSULTADOR_IDENTIDAD_SEDE');

export interface ConsultadorIdentidadSede {
  obtenerPorSede(sedeId: string): Promise<IdentidadSedeResumen | null>;
}
