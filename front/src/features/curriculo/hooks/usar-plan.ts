'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/bff/cliente';
import { claves } from '@/lib/query/claves';
import type { PlanEstudio } from '@/types/curriculo';
import type { ContextoDescriptor } from '@/types/auth';

type Ctx = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

export function usarPlan(ctx: Ctx, id: string) {
  return useQuery({
    queryKey: claves.curriculo.plan(ctx, id),
    queryFn: ({ signal }) =>
      apiFetch<PlanEstudio>(`/api/panel/curriculo/planes/${id}`, {}, signal),
    enabled: Boolean(id),
  });
}
