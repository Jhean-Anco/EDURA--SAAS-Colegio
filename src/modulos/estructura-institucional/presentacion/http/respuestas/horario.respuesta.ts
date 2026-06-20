export class HorarioRespuesta {
  id!: string;
  sedeId!: string;
  diaSemana!: number;
  ordenIntervalo!: number;
  horaInicio!: string | null;
  horaFin!: string | null;
  cerrado!: boolean;
  observaciones!: string | null;
  estado!: string;
}
