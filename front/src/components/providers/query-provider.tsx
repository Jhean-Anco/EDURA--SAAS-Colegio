'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { obtenerClienteQuery } from '@/lib/query/cliente';

export function QueryProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const client = obtenerClienteQuery();
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
