import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { CambiarEstadoServicioBasicoEntrada } from '../../dominio/servicios-basicos/repositorio-servicios-basicos.puerto';
import { ServicioBasicoSedeRespuesta } from '../../dominio/servicios-basicos/servicio-basico.respuesta';
import { RepositorioServiciosBasicos } from './puertos';

export class CambiarEstadoServicioBasicoCasoUso {
  constructor(private readonly repositorio: RepositorioServiciosBasicos) {}

  async ejecutar(
    id: string,
    estado: 'ACTIVO' | 'SUSPENDIDO' | 'INACTIVO' | 'BAJA',
  ): Promise<ServicioBasicoSedeRespuesta> {
    const servicio = await this.repositorio.buscarPorId(id);
    if (!servicio) {
      throw new RecursoNoEncontradoError('El servicio básico no existe.');
    }
    const entrada: CambiarEstadoServicioBasicoEntrada = {
      id,
      estadoServicio: estado,
    };
    return this.repositorio.cambiarEstado(entrada);
  }
}
