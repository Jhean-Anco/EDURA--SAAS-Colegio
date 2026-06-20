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
  if (
    ctx.ambito === 'PLATAFORMA'
      ? false
      : !ctx.institucionId || ctx.institucionId !== institucionId
  ) {
    throw new NotFoundException('RECURSO_NO_ENCONTRADO');
  }
}

export function validarSedeDelContexto(
  contexto: ContextoSolicitudAutenticada | undefined,
  institucionId: string,
  sedeId: string,
): void {
  const ctx = exigirContextoAutenticado(contexto);
  if (ctx.ambito === 'PLATAFORMA') {
    return;
  }
  if (!ctx.institucionId) {
    throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
  }
  if (ctx.ambito === 'INSTITUCION') {
    if (ctx.institucionId !== institucionId) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    return;
  }
  if (!ctx.sedeId) {
    throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
  }
  if (ctx.sedeId !== sedeId || ctx.institucionId !== institucionId) {
    throw new NotFoundException('RECURSO_NO_ENCONTRADO');
  }
}

export function validarPlataformaOContextoInstitucional(
  contexto: ContextoSolicitudAutenticada | undefined,
): ContextoSolicitudAutenticada {
  const ctx = exigirContextoAutenticado(contexto);
  if (ctx.ambito === 'PLATAFORMA') {
    return ctx;
  }
  if (ctx.ambito === 'INSTITUCION' && ctx.institucionId) {
    return ctx;
  }
  if (ctx.ambito === 'SEDE' && ctx.institucionId && ctx.sedeId) {
    return ctx;
  }
  throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
}
