import { RepositorioElementosInfraestructuraTypeormConsulta } from '../../infraestructura/persistencia/typeorm/consultas/repositorio-elementos-infraestructura.typeorm-consulta';

export class ListarElementosInfraestructuraConsulta {
  constructor(
    private readonly consulta: RepositorioElementosInfraestructuraTypeormConsulta,
  ) {}

  ejecutar(
    sedeId: string,
  ): Promise<
    import('../../infraestructura/persistencia/typeorm/entidades/elemento-infraestructura.typeorm-entidad').ElementoInfraestructuraTypeormEntidad[]
  > {
    return this.consulta.listarPorSede(sedeId);
  }
}
