'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps): React.JSX.Element {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold text-[--color-text-primary]">Algo salió mal</h2>
      <p className="text-[--color-text-secondary]">Ocurrió un error inesperado.</p>
      <Button onClick={reset}>Intentar de nuevo</Button>
    </div>
  );
}
