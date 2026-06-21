import type { ContextoDescriptor } from '@/types/auth';

type ClaveContexto = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

export const claves = {
  autenticacion: {
    contextos: () => ['autenticacion', 'contextos'] as const,
  },
  panel: {
    todos: (ctx: ClaveContexto) => ['panel', ctx] as const,
    resumen: (ctx: ClaveContexto) => ['panel', ctx, 'resumen'] as const,
  },
} as const;
