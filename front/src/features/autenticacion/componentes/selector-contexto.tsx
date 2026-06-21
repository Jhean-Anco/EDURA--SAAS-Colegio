'use client';

import { useRouter } from 'next/navigation';
import { Building2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorDisplay } from '@/components/feedback/error-display';
import { Skeleton } from '@/components/ui/skeleton';
import { usarContextos } from '../hooks/usar-contextos';
import { usarSeleccionarContexto } from '../hooks/usar-seleccionar-contexto';
import type { ContextoDescriptor } from '@/types/auth';

export function SelectorContexto(): React.JSX.Element {
  const router = useRouter();
  const { data: contextos, isLoading, error: errorCarga } = usarContextos();
  const { mutate: seleccionar, isPending, error: errorSeleccion, variables } = usarSeleccionarContexto();

  const handleSeleccionar = (ctx: ContextoDescriptor) => {
    seleccionar(
      { institucionId: ctx.institucionId, ambito: ctx.ambito, sedeId: ctx.sedeId },
      { onSuccess: () => router.push('/panel') },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (errorCarga) {
    return <ErrorDisplay error={errorCarga as Error} />;
  }

  if (!contextos?.length) {
    return (
      <p className="text-sm text-[--color-text-secondary] text-center py-4">
        No tienes contextos institucionales disponibles.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {errorSeleccion && <ErrorDisplay error={errorSeleccion as Error} />}

      {contextos.map((ctx) => {
        const esInstitucion = ctx.ambito === 'INSTITUCION';
        const cargandoEste =
          isPending &&
          variables?.institucionId === ctx.institucionId &&
          variables?.ambito === ctx.ambito &&
          variables?.sedeId === ctx.sedeId;

        return (
          <Button
            key={`${ctx.institucionId}-${ctx.ambito}-${ctx.sedeId ?? 'inst'}`}
            variant="outline"
            className="w-full h-auto justify-start gap-4 p-4 text-left"
            onClick={() => handleSeleccionar(ctx)}
            disabled={isPending}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[--color-brand-50] dark:bg-[--color-brand-900]/20">
              {esInstitucion ? (
                <Building2 className="h-5 w-5 text-[--color-brand-600]" aria-hidden />
              ) : (
                <MapPin className="h-5 w-5 text-[--color-brand-600]" aria-hidden />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[--color-text-primary] truncate">
                  {esInstitucion ? ctx.nombreInstitucion : ctx.nombreSede}
                </span>
                <Badge variant="secondary" className="shrink-0">
                  {esInstitucion ? 'Institución' : 'Sede'}
                </Badge>
              </div>
              {!esInstitucion && (
                <p className="text-xs text-[--color-text-muted] truncate">{ctx.nombreInstitucion}</p>
              )}
            </div>
            {cargandoEste && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[--color-brand-600]" aria-hidden />}
          </Button>
        );
      })}
    </div>
  );
}
