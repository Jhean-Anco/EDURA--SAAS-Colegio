import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { RepositorioSedes } from '../../dominio/sedes/repositorio-sedes.puerto';

export class ObtenerSedeConsulta {
  constructor(private readonly repositorio: RepositorioSedes) {}

  async ejecutar(institucionId: string, id: string) {
    const sede = await this.repositorio.buscarPorInstitucionYId(
      institucionId,
      id,
    );
    if (!sede) {
      throw new RecursoNoEncontradoError('La sede solicitada no existe.');
    }
    return sede;
  }
}
