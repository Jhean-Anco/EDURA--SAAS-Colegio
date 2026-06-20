import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { RepositorioInstituciones } from '../../dominio/instituciones/repositorio-instituciones.puerto';

export class ObtenerInstitucionConsulta {
  constructor(private readonly repositorio: RepositorioInstituciones) {}

  async ejecutar(id: string) {
    const institucion = await this.repositorio.buscarPorId(id);
    if (!institucion) {
      throw new RecursoNoEncontradoError(
        'La institucion solicitada no existe.',
      );
    }
    return institucion;
  }
}
