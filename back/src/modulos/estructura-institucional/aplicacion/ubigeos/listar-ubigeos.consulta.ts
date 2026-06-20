import { ConsultadorUbigeos } from '../../dominio/ubigeos/consultador-ubigeos.puerto';

export class ListarUbigeosConsulta {
  constructor(private readonly consultador: ConsultadorUbigeos) {}

  async ejecutar() {
    return this.consultador.listar();
  }
}
