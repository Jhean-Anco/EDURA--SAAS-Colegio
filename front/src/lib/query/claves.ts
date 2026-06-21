import type { ContextoDescriptor } from '@/types/auth';
import type { FiltrosPlanes } from '@/types/curriculo';

type ClaveContexto = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

export const claves = {
  autenticacion: {
    contextos: () => ['autenticacion', 'contextos'] as const,
  },
  panel: {
    todos: (ctx: ClaveContexto) => ['panel', ctx] as const,
    resumen: (ctx: ClaveContexto) => ['panel', ctx, 'resumen'] as const,
  },
  estructuraAcademica: {
    anios: (ctx: ClaveContexto, estado?: string) =>
      ['estructura-academica', ctx, 'anios', estado ?? null] as const,
    grados: (ctx: ClaveContexto, idNivel?: string, estado?: string) =>
      ['estructura-academica', ctx, 'grados', idNivel ?? null, estado ?? null] as const,
  },
  curriculo: {
    areas: (ctx: ClaveContexto, estado?: string) =>
      ['curriculo', ctx, 'areas', estado ?? null] as const,
    asignaturas: (ctx: ClaveContexto, idArea?: string, estado?: string) =>
      ['curriculo', ctx, 'asignaturas', idArea ?? null, estado ?? null] as const,
    planes: (ctx: ClaveContexto, filtros?: FiltrosPlanes) =>
      ['curriculo', ctx, 'planes', filtros ?? {}] as const,
    plan: (ctx: ClaveContexto, id: string) =>
      ['curriculo', ctx, 'planes', id] as const,
    detalles: (ctx: ClaveContexto, idPlan: string) =>
      ['curriculo', ctx, 'planes', idPlan, 'detalles'] as const,
  },
} as const;
