'use client';

import { useMutation } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirError } from '@/lib/errores/traducir-error';
import type { ErrorApi } from '@/lib/errores/traducir-error';
import type { LoginFormValues } from '../esquemas/login.schema';

async function iniciarSesion(datos: LoginFormValues): Promise<void> {
  const res = await fetch('/api/autenticacion/iniciar-sesion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    const json: unknown = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirError(json, res.status);
    throw new Error('Error al iniciar sesión');
  }
}

export function usarIniciarSesion() {
  return useMutation<void, ErrorApi | Error, LoginFormValues>({
    mutationFn: iniciarSesion,
  });
}
