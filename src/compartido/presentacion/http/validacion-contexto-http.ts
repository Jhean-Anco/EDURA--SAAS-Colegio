import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ContextoSolicitudAutenticada } from '../../aplicacion/contexto-solicitud-autenticada';

export function exigirContextoAutenticado(
  contexto: ContextoSolicitudAutenticada | undefined,
): ContextoSolicitudAutenticada {
  if (!contexto) {
    throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
  }
  return contexto;
}

export function validarInstitucionDelContexto(
  contexto: ContextoSolicitudAutenticada | undefined,
  institucionId: string,
): void {
  const ctx = exigirContextoAutenticado(contexto);
  if (ctx.ambito !== 'PLATAFORMA' && ctx.institucionId !== institucionId) {
    throw new NotFoundException('RECURSO_NO_ENCONTRADO');
  }
}

export function validarSedeDelContexto(
  contexto: ContextoSolicitudAutenticada | undefined,
  institucionId: string,
  sedeId: string,
): void {
  const ctx = exigirContextoAutenticado(contexto);
  if (!ctx.institucionId) {
    throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
  }
  if (ctx.ambito === 'SEDE') {
    if (ctx.sedeId !== sedeId || ctx.institucionId !== institucionId) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    return;
  }
  if (ctx.ambito === 'INSTITUCION' && ctx.institucionId !== institucionId) {
    throw new NotFoundException('RECURSO_NO_ENCONTRADO');
  }
}
