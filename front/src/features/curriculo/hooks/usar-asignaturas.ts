'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/bff/cliente';
import { claves } from '@/lib/query/claves';
import type { Asignatura } from '@/types/curriculo';
import type { ContextoDescriptor } from '@/types/auth';

type Ctx = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

export function usarAsignaturas(ctx: Ctx, idArea?: string, estado?: string) {
  const params = new URLSearchParams();
  if (idArea) params.set('idArea', idArea);
  if (estado) params.set('estado', estado);
  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: claves.curriculo.asignaturas(ctx, idArea, estado),
    queryFn: ({ signal }) =>
      apiFetch<Asignatura[]>(`/api/panel/curriculo/asignaturas${qs}`, {}, signal),
    staleTime: 5 * 60 * 1000,
  });
}
