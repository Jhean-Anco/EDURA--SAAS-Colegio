'use client';

import { QueryClient } from '@tanstack/react-query';
import { esSesionExpirada } from '@/lib/errores/traducir-error';

let clienteQuery: QueryClient | undefined;

export function obtenerClienteQuery(): QueryClient {
  if (!clienteQuery) {
    clienteQuery = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          retry: (failureCount, error) => {
            if (esSesionExpirada(error)) return false;
            return failureCount < 2;
          },
        },
        mutations: {
          retry: false,
        },
      },
    });
  }
  return clienteQuery;
}
