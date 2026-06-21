'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirError } from '@/lib/errores/traducir-error';
import type { ErrorApi } from '@/lib/errores/traducir-error';
import type { Ambito } from '@/types/auth';

interface EntradaSeleccion {
  institucionId: string;
  ambito: Ambito;
  sedeId?: string | null;
}

function leerCsrfToken(): string {
  return (
    document.cookie
      .split('; ')
      .find((c) => c.startsWith('edura_csrf='))
      ?.split('=')[1] ?? ''
  );
}

async function seleccionarContexto(datos: EntradaSeleccion): Promise<void> {
  const res = await fetch('/api/autenticacion/seleccionar-contexto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': leerCsrfToken(),
    },
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    const json: unknown = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirError(json, res.status);
    throw new Error('Error al seleccionar contexto');
  }
}

export function usarSeleccionarContexto() {
  const queryClient = useQueryClient();

  return useMutation<void, ErrorApi | Error, EntradaSeleccion>({
    mutationFn: seleccionarContexto,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
