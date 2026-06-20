import {
  EstadoIncompatibleError,
  RecursoNoEncontradoError,
} from '../../../../compartido/dominio/errores-dominio';
import { RepositorioSedes } from '../../dominio/sedes/repositorio-sedes.puerto';

export class CambiarEstadoSedeCasoUso {
  constructor(private readonly repositorio: RepositorioSedes) {}

  async ejecutar(
    institucionId: string,
    sedeId: string,
    estado: 'ACTIVA' | 'INACTIVA' | 'BAJA',
  ): Promise<void> {
    const sede = await this.repositorio.buscarPorInstitucionYId(
      institucionId,
      sedeId,
    );
    if (!sede) {
      throw new RecursoNoEncontradoError('La sede solicitada no existe.');
    }
    if (estado === 'BAJA') {
      sede.darDeBaja();
    } else if (estado === 'ACTIVA') {
      sede.activar();
    } else if (estado === 'INACTIVA') {
      sede.desactivar();
    } else {
      throw new EstadoIncompatibleError('Estado de sede invalido.');
    }
    await this.repositorio.guardar(sede);
  }
}
