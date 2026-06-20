import {
  RecursoNoEncontradoError,
  EstadoIncompatibleError,
} from '../../../../compartido/dominio/errores-dominio';
import { RepositorioInstituciones } from '../../dominio/instituciones/repositorio-instituciones.puerto';

export class CambiarEstadoInstitucionCasoUso {
  constructor(private readonly repositorio: RepositorioInstituciones) {}

  async ejecutar(
    id: string,
    estado: 'ACTIVA' | 'INACTIVA' | 'BAJA',
  ): Promise<void> {
    const institucion = await this.repositorio.buscarPorId(id);
    if (!institucion) {
      throw new RecursoNoEncontradoError(
        'La institucion solicitada no existe.',
      );
    }
    if (estado === 'BAJA') {
      institucion.darDeBaja();
    } else if (estado === 'ACTIVA') {
      institucion.activar();
    } else if (estado === 'INACTIVA') {
      institucion.desactivar();
    } else {
      throw new EstadoIncompatibleError('Estado de institucion invalido.');
    }
    await this.repositorio.actualizar(institucion);
  }
}
