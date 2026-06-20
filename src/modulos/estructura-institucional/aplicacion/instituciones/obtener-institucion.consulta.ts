import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { RepositorioInstituciones } from '../../dominio/instituciones/repositorio-instituciones.puerto';
import { ContextoSolicitudAutenticada } from '../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { ForbiddenException } from '@nestjs/common';

export class ObtenerInstitucionConsulta {
  constructor(private readonly repositorio: RepositorioInstituciones) {}

  async ejecutar(
    id: string,
    contexto: ContextoSolicitudAutenticada | undefined,
  ) {
    if (!contexto || !contexto.ambito) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    if (contexto.ambito !== 'PLATAFORMA' && !contexto.institucionId) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    const institucion = await this.repositorio.buscarPorIdYAlcance(id, {
      ambito: contexto.ambito,
      institucionId: contexto.institucionId,
    });
    if (!institucion) {
      throw new RecursoNoEncontradoError(
        'La institucion solicitada no existe.',
      );
    }
    return institucion;
  }
}
