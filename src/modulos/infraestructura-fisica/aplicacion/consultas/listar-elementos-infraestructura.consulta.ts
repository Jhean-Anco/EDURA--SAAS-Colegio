import { ElementoInfraestructuraResumen } from '../../dominio/infraestructura/consultador-infraestructura.puerto';
import { RepositorioElementosInfraestructuraTypeormConsulta } from '../../infraestructura/persistencia/typeorm/consultas/repositorio-elementos-infraestructura.typeorm-consulta';

export class ListarElementosInfraestructuraConsulta {
  constructor(
    private readonly consulta: RepositorioElementosInfraestructuraTypeormConsulta,
  ) {}

  ejecutar(sedeId: string): Promise<ElementoInfraestructuraResumen[]> {
    return this.consulta.listarPorSede(sedeId);
  }
}
