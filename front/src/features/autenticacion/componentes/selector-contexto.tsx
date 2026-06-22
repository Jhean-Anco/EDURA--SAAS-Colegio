'use client';

import { useRouter } from 'next/navigation';
import { Building2, MapPin, Loader2, Shield } from 'lucide-react';
import { useEffect } from 'react';
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

  useEffect(() => {
    if (contextos && contextos.length === 1 && contextos[0]) {
      const ctx = contextos[0];
      seleccionar(
        {
          ambito: ctx.ambito,
          rolId: ctx.rolId,
          rolCodigo: ctx.rolCodigo,
          institucionId: ctx.institucionId,
          sedeId: ctx.sedeId,
          institucionNombre: ctx.institucionNombre,
          sedeNombre: ctx.sedeNombre,
        },
        { onSuccess: () => router.push('/panel') },
      );
    }
  }, [contextos, seleccionar, router]);

  const handleSeleccionar = (ctx: ContextoDescriptor) => {
    seleccionar(
      {
        ambito: ctx.ambito,
        rolId: ctx.rolId,
        rolCodigo: ctx.rolCodigo,
        institucionId: ctx.institucionId,
        sedeId: ctx.sedeId,
        institucionNombre: ctx.institucionNombre,
        sedeNombre: ctx.sedeNombre,
      },
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
      <div className="text-center py-6 space-y-4">
        <p className="text-sm text-[--color-text-secondary]">
          Acceso no configurado: Tu usuario no tiene ningún rol o contexto de acceso configurado.
        </p>
        <p className="text-xs text-[--color-text-muted]">
          Por favor, ponte en contacto con el administrador de la plataforma.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {errorSeleccion && <ErrorDisplay error={errorSeleccion as Error} />}

      {contextos.map((ctx) => {
        const esPlataforma = ctx.ambito === 'PLATAFORMA';
        const esInstitucion = ctx.ambito === 'INSTITUCION';
        const cargandoEste =
          isPending &&
          variables?.rolId === ctx.rolId &&
          variables?.ambito === ctx.ambito &&
          variables?.institucionId === ctx.institucionId &&
          variables?.sedeId === ctx.sedeId;

        return (
          <Button
            key={`${ctx.rolId}-${ctx.ambito}-${ctx.institucionId ?? 'plat'}-${ctx.sedeId ?? 'sede'}`}
            variant="outline"
            className="w-full h-auto justify-start gap-4 p-4 text-left"
            onClick={() => handleSeleccionar(ctx)}
            disabled={isPending}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[--color-brand-50] dark:bg-[--color-brand-900]/20">
              {esPlataforma ? (
                <Shield className="h-5 w-5 text-[--color-brand-600]" aria-hidden />
              ) : esInstitucion ? (
                <Building2 className="h-5 w-5 text-[--color-brand-600]" aria-hidden />
              ) : (
                <MapPin className="h-5 w-5 text-[--color-brand-600]" aria-hidden />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[--color-text-primary] truncate">
                  {esPlataforma ? 'Plataforma EDURA' : esInstitucion ? ctx.institucionNombre : ctx.sedeNombre}
                </span>
                <Badge variant="secondary" className="shrink-0">
                  {esPlataforma ? 'Plataforma' : esInstitucion ? 'Institución' : 'Sede'}
                </Badge>
              </div>
              {!esPlataforma && !esInstitucion && (
                <p className="text-xs text-[--color-text-muted] truncate">{ctx.institucionNombre}</p>
              )}
            </div>
            {cargandoEste && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[--color-brand-600]" aria-hidden />}
          </Button>
        );
      })}
    </div>
  );
}

