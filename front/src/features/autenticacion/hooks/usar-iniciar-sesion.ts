'use client';

import { useMutation } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirBackendError } from '@/lib/errores/traducir-error';
import type { ErrorApi } from '@/lib/errores/traducir-error';
import type { LoginFormValues } from '../esquemas/login.schema';

interface IniciarSesionResultado {
  ok: boolean;
  requiereCambioClave: boolean;
}

async function iniciarSesion(datos: LoginFormValues): Promise<IniciarSesionResultado> {
  const res = await fetch('/api/autenticacion/iniciar-sesion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    const json: unknown = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al iniciar sesión');
  }

  return res.json() as Promise<IniciarSesionResultado>;
}

export function usarIniciarSesion() {
  return useMutation<IniciarSesionResultado, ErrorApi | Error, LoginFormValues>({
    mutationFn: iniciarSesion,
  });
}

