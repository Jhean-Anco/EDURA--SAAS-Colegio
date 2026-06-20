import { ConsultadorRecursosIdentidad } from '../../dominio/identidad/consultador-recursos-identidad.puerto';

export class ListarRecursosIdentidadConsulta {
  constructor(private readonly consultador: ConsultadorRecursosIdentidad) {}

  async ejecutar(sedeId: string) {
    return this.consultador.listarPorSede(sedeId);
  }
}
