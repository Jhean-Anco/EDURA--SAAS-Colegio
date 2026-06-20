import { HorarioSedeResumen } from './horario-sede.resumen';

export const CONSULTADOR_HORARIOS_SEDE = Symbol('CONSULTADOR_HORARIOS_SEDE');

export interface ConsultadorHorariosSede {
  listarPorSede(sedeId: string): Promise<HorarioSedeResumen[]>;
}
