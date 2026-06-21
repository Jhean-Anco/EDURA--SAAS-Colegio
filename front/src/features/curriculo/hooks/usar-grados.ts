'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/bff/cliente';
import { claves } from '@/lib/query/claves';
import type { GradoEducativo } from '@/types/curriculo';
import type { ContextoDescriptor } from '@/types/auth';

type Ctx = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

export function usarGrados(ctx: Ctx, idNivel?: string, estado?: string) {
  const params = new URLSearchParams();
  if (idNivel) params.set('idNivel', idNivel);
  if (estado) params.set('estado', estado);
  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: claves.estructuraAcademica.grados(ctx, idNivel, estado),
    queryFn: ({ signal }) =>
      apiFetch<GradoEducativo[]>(`/api/panel/estructura-academica/grados${qs}`, {}, signal),
    staleTime: 5 * 60 * 1000,
  });
}
