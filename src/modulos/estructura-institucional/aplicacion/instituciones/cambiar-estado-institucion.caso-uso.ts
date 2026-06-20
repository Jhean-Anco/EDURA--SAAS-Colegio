import {
  RecursoNoEncontradoError,
  EstadoIncompatibleError,
} from '../../../../compartido/dominio/errores-dominio';
import { RepositorioInstituciones } from '../../dominio/instituciones/repositorio-instituciones.puerto';
import { ContextoSolicitudAutenticada } from '../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { ForbiddenException } from '@nestjs/common';

export class CambiarEstadoInstitucionCasoUso {
  constructor(private readonly repositorio: RepositorioInstituciones) {}

  async ejecutar(
    id: string,
    estado: 'ACTIVA' | 'INACTIVA' | 'BAJA',
    contexto: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
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
    if (estado === 'BAJA') {
      institucion.darDeBaja();
    } else if (estado === 'ACTIVA') {
      institucion.activar();
    } else if (estado === 'INACTIVA') {
      institucion.desactivar();
    } else {
      throw new EstadoIncompatibleError('Estado de institucion invalido.');
    }
    const actualizado = await this.repositorio.actualizarPorIdYAlcance(
      id,
      {
        ambito: contexto.ambito,
        institucionId: contexto.institucionId,
      },
      institucion,
    );
    if (!actualizado) {
      throw new RecursoNoEncontradoError(
        'La institucion solicitada no existe.',
      );
    }
  }
}
