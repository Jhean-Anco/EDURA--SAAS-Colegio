import { ConsultadorServiciosBasicos } from './puertos';

export class ListarServiciosBasicosSedeConsulta {
  constructor(private readonly consultador: ConsultadorServiciosBasicos) {}
  ejecutar(sedeId: string) {
    return this.consultador.listarPorSede(sedeId);
  }
}
