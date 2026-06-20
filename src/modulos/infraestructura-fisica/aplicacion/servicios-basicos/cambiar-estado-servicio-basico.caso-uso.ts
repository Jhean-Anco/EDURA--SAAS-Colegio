import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { CambiarEstadoServicioBasicoEntrada } from '../../dominio/servicios-basicos/repositorio-servicios-basicos.puerto';
import { ServicioBasicoSedeRespuesta } from '../../dominio/servicios-basicos/servicio-basico.respuesta';
import { RepositorioServiciosBasicos } from './puertos';

export class CambiarEstadoServicioBasicoCasoUso {
  constructor(private readonly repositorio: RepositorioServiciosBasicos) {}

  async ejecutar(
    id: string,
    sedeId: string,
    estado: 'ACTIVO' | 'SUSPENDIDO' | 'INACTIVO' | 'BAJA',
  ): Promise<ServicioBasicoSedeRespuesta> {
    const servicio = await this.repositorio.buscarPorIdEnSede(id, sedeId);
    if (!servicio) {
      throw new RecursoNoEncontradoError('El servicio basico no existe.');
    }
    const entrada: CambiarEstadoServicioBasicoEntrada & { sedeId: string } = {
      id,
      estadoServicio: estado,
      sedeId,
    };
    return this.repositorio.cambiarEstado(entrada);
  }
}
