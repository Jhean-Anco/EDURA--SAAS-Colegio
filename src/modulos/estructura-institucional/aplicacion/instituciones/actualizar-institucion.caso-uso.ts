import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { RepositorioInstituciones } from '../../dominio/instituciones/repositorio-instituciones.puerto';
import { ContextoSolicitudAutenticada } from '../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { ForbiddenException } from '@nestjs/common';

export interface ActualizarInstitucionEntrada {
  id: string;
  nombreLegal: string;
  nombreCorto?: string | null;
  tipoGestion?: string | null;
}

export class ActualizarInstitucionCasoUso {
  constructor(private readonly repositorio: RepositorioInstituciones) {}

  async ejecutar(
    entrada: ActualizarInstitucionEntrada,
    contexto: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    if (!contexto || !contexto.ambito) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    if (contexto.ambito !== 'PLATAFORMA' && !contexto.institucionId) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    const institucion = await this.repositorio.buscarPorIdYAlcance(entrada.id, {
      ambito: contexto.ambito,
      institucionId: contexto.institucionId,
    });
    if (!institucion) {
      throw new RecursoNoEncontradoError(
        'La institucion solicitada no existe.',
      );
    }
    institucion.actualizarDatos(entrada);
    const actualizado = await this.repositorio.actualizarPorIdYAlcance(
      entrada.id,
      { ambito: contexto.ambito, institucionId: contexto.institucionId },
      institucion,
    );
    if (!actualizado) {
      throw new RecursoNoEncontradoError(
        'La institucion solicitada no existe.',
      );
    }
  }
}
