'use client';

import { AlertCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ErrorApi } from '@/lib/errores/traducir-error';

interface ErrorDisplayProps {
  error: ErrorApi | Error | string;
  className?: string;
}

export function ErrorDisplay({ error, className }: ErrorDisplayProps): React.JSX.Element {
  const [verDetalle, setVerDetalle] = useState(false);

  const mensaje =
    typeof error === 'string'
      ? error
      : 'mensajeUsuario' in error
        ? error.mensajeUsuario
        : error.message;

  const correlacionId =
    typeof error !== 'string' && 'correlacionId' in error ? error.correlacionId : null;

  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{mensaje}</p>
          {correlacionId && (
            <button
              type="button"
              onClick={() => setVerDetalle((v) => !v)}
              className="mt-1 flex items-center gap-1 text-xs text-red-600 hover:underline dark:text-red-400"
            >
              Detalles técnicos
              <ChevronDown
                className={cn('h-3 w-3 transition-transform', verDetalle && 'rotate-180')}
              />
            </button>
          )}
          {verDetalle && correlacionId && (
            <p className="mt-1 font-mono text-xs text-red-500 dark:text-red-500">
              ID: {correlacionId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
