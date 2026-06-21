'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/bff/cliente';
import { claves } from '@/lib/query/claves';
import type { AnioAcademico } from '@/types/curriculo';
import type { ContextoDescriptor } from '@/types/auth';

type Ctx = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

export function usarAnios(ctx: Ctx, estado?: string) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: claves.estructuraAcademica.anios(ctx, estado),
    queryFn: ({ signal }) =>
      apiFetch<AnioAcademico[]>(`/api/panel/estructura-academica/anios${qs}`, {}, signal),
    staleTime: 5 * 60 * 1000,
  });
}
