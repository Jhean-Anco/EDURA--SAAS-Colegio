import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { InstitucionTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/institucion.typeorm-repositorio';

export interface ActualizarInstitucionEntrada {
  id: string;
  nombreLegal: string;
  nombreCorto?: string | null;
  tipoGestion?: string | null;
}

export class ActualizarInstitucionCasoUso {
  constructor(private readonly repositorio: InstitucionTypeormRepositorio) {}

  async ejecutar(entrada: ActualizarInstitucionEntrada): Promise<void> {
    const institucion = await this.repositorio.buscarPorId(entrada.id);
    if (!institucion) {
      throw new RecursoNoEncontradoError(
        'La institucion solicitada no existe.',
      );
    }
    institucion.actualizarDatos(entrada);
    await this.repositorio.actualizar(institucion);
  }
}
