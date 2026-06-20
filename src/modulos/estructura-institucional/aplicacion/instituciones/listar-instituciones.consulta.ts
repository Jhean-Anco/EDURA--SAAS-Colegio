import { RepositorioInstituciones } from '../../dominio/instituciones/repositorio-instituciones.puerto';
import { ContextoSolicitudAutenticada } from '../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { ForbiddenException } from '@nestjs/common';

export class ListarInstitucionesConsulta {
  constructor(private readonly repositorio: RepositorioInstituciones) {}

  async ejecutar(ctx: ContextoSolicitudAutenticada | undefined) {
    if (!ctx || !ctx.ambito) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    if (ctx.ambito !== 'PLATAFORMA' && !ctx.institucionId) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    return this.repositorio.listarPorAlcance({
      ambito: ctx.ambito,
      institucionId: ctx.institucionId,
    });
  }
}
