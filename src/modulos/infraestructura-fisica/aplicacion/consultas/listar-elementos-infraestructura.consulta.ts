import {
  ConsultadorInfraestructura,
  ElementoInfraestructuraResumen,
} from '../../dominio/infraestructura/consultador-infraestructura.puerto';

export class ListarElementosInfraestructuraConsulta {
  constructor(private readonly consulta: ConsultadorInfraestructura) {}

  ejecutar(sedeId: string): Promise<ElementoInfraestructuraResumen[]> {
    return this.consulta.listarPorSede(sedeId);
  }
}
