'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Limpia localStorage, sessionStorage y caché de React Query
 * al detectar un nuevo arranque de la aplicación.
 *
 * Usa un flag en sessionStorage que sobrevive recargas pero
 * NO sobrevive al cerrar la pestaña/navegador ni al reiniciar
 * el servidor de desarrollo (que fuerza una recarga completa).
 */
const FLAG = '__edura_sesion_activa';
const VERSION_KEY = '__edura_build_id';

export function LimpiadorAlmacenamiento(): null {
  const queryClient = useQueryClient();
  const limpiado = useRef(false);

  useEffect(() => {
    if (limpiado.current) return;
    limpiado.current = true;

    const buildId = process.env.NEXT_PUBLIC_BUILD_ID ?? '__dev__';
    const storedBuild = sessionStorage.getItem(VERSION_KEY);
    const sesionActiva = sessionStorage.getItem(FLAG);

    // Limpiar si: no hay flag de sesión activa, o el build cambió (reinicio de servidor)
    if (!sesionActiva || storedBuild !== buildId) {
      // Preservar el tema del usuario antes de limpiar
      const tema = localStorage.getItem('theme');

      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();

      // Restaurar solo el tema
      if (tema) {
        localStorage.setItem('theme', tema);
      }

      sessionStorage.setItem(FLAG, '1');
      sessionStorage.setItem(VERSION_KEY, buildId);
    }
  }, [queryClient]);

  return null;
}
