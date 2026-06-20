import { RecursoIdentidadResumen } from './recursos-identidad.resumen';

export const CONSULTADOR_RECURSOS_IDENTIDAD = Symbol(
  'CONSULTADOR_RECURSOS_IDENTIDAD',
);

export interface ConsultadorRecursosIdentidad {
  listarPorSede(sedeId: string): Promise<RecursoIdentidadResumen[]>;
}
