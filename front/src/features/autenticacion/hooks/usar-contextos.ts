'use client';

import { useQuery } from '@tanstack/react-query';
import { claves } from '@/lib/query/claves';
import { esBackendError } from '@/types/api';
import { traducirError } from '@/lib/errores/traducir-error';
import type { ContextoDescriptor } from '@/types/auth';

async function obtenerContextos(): Promise<ContextoDescriptor[]> {
  const res = await fetch('/api/autenticacion/contextos');

  if (!res.ok) {
    const json: unknown = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirError(json, res.status);
    throw new Error('Error al obtener contextos');
  }

  return res.json() as Promise<ContextoDescriptor[]>;
}

export function usarContextos() {
  return useQuery({
    queryKey: claves.autenticacion.contextos(),
    queryFn: obtenerContextos,
    staleTime: 0,
  });
}
