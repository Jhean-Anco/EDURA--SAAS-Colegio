import { ConsultadorHorariosSede } from '../../dominio/horarios-sede/consultador-horarios.puerto';
import { HorarioSedeResumen } from '../../dominio/horarios-sede/horario-sede.resumen';

export class ListarHorariosSedeConsulta {
  constructor(private readonly consultador: ConsultadorHorariosSede) {}

  ejecutar(idSede: string): Promise<HorarioSedeResumen[]> {
    return this.consultador.listarPorSede(idSede);
  }
}
