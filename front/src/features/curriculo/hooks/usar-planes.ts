'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/bff/cliente';
import { claves } from '@/lib/query/claves';
import type { PlanEstudioItem, FiltrosPlanes } from '@/types/curriculo';
import type { ContextoDescriptor } from '@/types/auth';

type Ctx = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

export function usarPlanes(ctx: Ctx, filtros: FiltrosPlanes = {}) {
  const params = new URLSearchParams();
  if (filtros.idAnio) params.set('idAnio', filtros.idAnio);
  if (filtros.idGrado) params.set('idGrado', filtros.idGrado);
  if (filtros.estado) params.set('estado', filtros.estado);
  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: claves.curriculo.planes(ctx, filtros),
    queryFn: ({ signal }) =>
      apiFetch<PlanEstudioItem[]>(`/api/panel/curriculo/planes${qs}`, {}, signal),
  });
}
