import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { ServicioBasicoTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/servicio-basico.typeorm-repositorio';

export class CambiarEstadoServicioBasicoCasoUso {
  constructor(private readonly repositorio: ServicioBasicoTypeormRepositorio) {}

  async ejecutar(
    id: string,
    estado: 'ACTIVO' | 'SUSPENDIDO' | 'INACTIVO' | 'BAJA',
  ): Promise<
    import('../../infraestructura/persistencia/typeorm/entidades/servicio-basico-sede.typeorm-entidad').ServicioBasicoSedeTypeormEntidad
  > {
    const servicio = await this.repositorio.buscarPorId(id);
    if (!servicio) {
      throw new RecursoNoEncontradoError('El servicio básico no existe.');
    }
    return this.repositorio.cambiarEstado(id, estado);
  }
}
