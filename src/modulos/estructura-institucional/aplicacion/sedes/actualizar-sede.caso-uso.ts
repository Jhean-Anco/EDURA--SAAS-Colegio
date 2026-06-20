import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { SedeTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/sede.typeorm-repositorio';

export interface ActualizarSedeEntrada {
  institucionId: string;
  sedeId: string;
  nombre: string;
}

export class ActualizarSedeCasoUso {
  constructor(private readonly repositorio: SedeTypeormRepositorio) {}

  async ejecutar(entrada: ActualizarSedeEntrada): Promise<void> {
    const sede = await this.repositorio.buscarPorInstitucionYId(
      entrada.institucionId,
      entrada.sedeId,
    );
    if (!sede) {
      throw new RecursoNoEncontradoError('La sede solicitada no existe.');
    }
    (sede as unknown as { nombre: string }).nombre = entrada.nombre.trim();
    await this.repositorio.guardar(sede);
  }
}
