import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { RepositorioSedes } from '../../dominio/sedes/repositorio-sedes.puerto';

export interface ActualizarSedeEntrada {
  institucionId: string;
  sedeId: string;
  nombre: string;
}

export class ActualizarSedeCasoUso {
  constructor(private readonly repositorio: RepositorioSedes) {}

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
