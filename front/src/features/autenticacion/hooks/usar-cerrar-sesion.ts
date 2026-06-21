'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

function leerCsrfToken(): string {
  return (
    document.cookie
      .split('; ')
      .find((c) => c.startsWith('edura_csrf='))
      ?.split('=')[1] ?? ''
  );
}

export function useCerrarSesion() {
  const [cargando, setCargando] = useState(false);
  const queryClient = useQueryClient();

  const cerrar = async () => {
    setCargando(true);
    try {
      await fetch('/api/autenticacion/cerrar-sesion', {
        method: 'POST',
        headers: { 'X-CSRF-Token': leerCsrfToken() },
      });
      queryClient.clear();
    } finally {
      setCargando(false);
    }
  };

  return { cerrar, cargando };
}
