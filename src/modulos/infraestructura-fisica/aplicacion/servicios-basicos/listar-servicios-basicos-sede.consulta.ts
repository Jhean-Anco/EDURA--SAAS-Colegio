import { ServicioBasicoTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/servicio-basico.typeorm-repositorio';

export class ListarServiciosBasicosSedeConsulta {
  constructor(private readonly repositorio: ServicioBasicoTypeormRepositorio) {}

  ejecutar(
    sedeId: string,
  ): Promise<
    import('../../infraestructura/persistencia/typeorm/entidades/servicio-basico-sede.typeorm-entidad').ServicioBasicoSedeTypeormEntidad[]
  > {
    return this.repositorio.listarPorSede(sedeId);
  }
}
