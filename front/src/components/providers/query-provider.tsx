'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { obtenerClienteQuery } from '@/lib/query/cliente';
import { LimpiadorAlmacenamiento } from './limpiador-almacenamiento';

export function QueryProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const client = obtenerClienteQuery();
  return (
    <QueryClientProvider client={client}>
      <LimpiadorAlmacenamiento />
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
