import { ForbiddenException } from '@nestjs/common';
import { ContextoSolicitudAutenticada } from '../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { AlcanceAcceso } from '../../dominio/puertos/curriculo.puerto';

export function alcanceDesdeContexto(
  ctx: ContextoSolicitudAutenticada | undefined,
): AlcanceAcceso {
  if (!ctx || !ctx.institucionId) {
    throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
  }
  if (ctx.ambito === 'SEDE' && ctx.sedeId) {
    return {
      usuarioId: ctx.usuarioId,
      institucionId: ctx.institucionId,
      ambito: 'SEDE',
      sedeId: ctx.sedeId,
    };
  }
  if (ctx.ambito === 'INSTITUCION' || ctx.ambito === 'PLATAFORMA') {
    return {
      usuarioId: ctx.usuarioId,
      institucionId: ctx.institucionId,
      ambito: 'INSTITUCION',
      sedeId: null,
    };
  }
  throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
}
