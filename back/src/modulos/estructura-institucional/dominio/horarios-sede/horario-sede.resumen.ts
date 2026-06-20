export interface HorarioSedeResumen {
  id: string;
  sedeId: string;
  diaSemana: number;
  horaInicio: string | null;
  horaFin: string | null;
  cerrado: boolean;
  ordenIntervalo: number;
  observaciones: string | null;
  estado: string;
}
