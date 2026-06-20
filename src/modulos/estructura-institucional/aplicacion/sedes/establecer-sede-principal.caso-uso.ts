import {
  EstadoIncompatibleError,
  RecursoNoEncontradoError,
} from '../../../../compartido/dominio/errores-dominio';
import { SedeTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/sede.typeorm-repositorio';

export class EstablecerSedePrincipalCasoUso {
  constructor(private readonly repositorio: SedeTypeormRepositorio) {}

  async ejecutar(institucionId: string, sedeId: string): Promise<void> {
    const sede = await this.repositorio.buscarPorInstitucionYId(
      institucionId,
      sedeId,
    );
    if (!sede) {
      throw new RecursoNoEncontradoError('La sede solicitada no existe.');
    }
    if (sede.estado !== 'ACTIVA') {
      throw new EstadoIncompatibleError(
        'Solo una sede activa puede ser principal.',
      );
    }
    if (sede.esPrincipal) {
      return;
    }
    await this.repositorio.establecerPrincipalAtomicamente(
      institucionId,
      sedeId,
    );
  }
}
