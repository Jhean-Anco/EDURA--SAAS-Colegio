'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FormularioPlan } from '@/features/curriculo/componentes/formulario-plan';
import { usarPlan } from '@/features/curriculo/hooks/usar-plan';
import { usarAnios } from '@/features/curriculo/hooks/usar-anios';
import { usarGrados } from '@/features/curriculo/hooks/usar-grados';
import { usarActualizarPlan } from '@/features/curriculo/hooks/usar-mutaciones-plan';
import { traducirError } from '@/lib/errores/traducir-error';
import { puedeEditarPlan } from '@/types/curriculo';
import type { CrearPlanFormValues } from '@/features/curriculo/esquemas/plan.schema';
import type { Ambito } from '@/types/auth';

type Ctx = { institucionId: string; ambito: Ambito; sedeId: string | null };

export function EditarPlanClient({ id, ctx }: { id: string; ctx: Ctx }): React.JSX.Element {
  const router = useRouter();
  const { data: plan, isLoading, isError, error, refetch } = usarPlan(ctx, id);
  const { data: anios = [] } = usarAnios(ctx);
  const { data: grados = [] } = usarGrados(ctx);
  const { mutateAsync, isPending } = usarActualizarPlan(ctx, id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-[--color-text-secondary]">{traducirError(error)}</p>
        <Button variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" /> Reintentar
        </Button>
      </div>
    );
  }

  if (!puedeEditarPlan(plan.estado)) {
    router.replace(`/panel/curriculo/planes-estudio/${id}`);
    return <></>;
  }

  const onSubmit = async (data: CrearPlanFormValues) => {
    try {
      await mutateAsync({
        codigo: data.codigo,
        nombre: data.nombre,
        observacion: data.observacion,
      });
      toast.success('Plan actualizado correctamente');
      router.push(`/panel/curriculo/planes-estudio/${id}`);
    } catch (err) {
      toast.error(traducirError(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/panel/curriculo/planes-estudio/${id}`}>
            <ChevronLeft className="h-4 w-4" /> Volver al detalle
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-[--color-text-primary]">Editar plan de estudio</h1>
        <p className="text-sm text-[--color-text-secondary]">
          Solo se pueden editar planes en estado Borrador.
        </p>
      </div>

      <div className="rounded-lg border border-[--color-border] bg-[--color-surface] p-6">
        <FormularioPlan
          anios={anios}
          grados={grados}
          planInicial={plan}
          isPending={isPending}
          onSubmit={onSubmit}
          onCancelar={() => router.push(`/panel/curriculo/planes-estudio/${id}`)}
        />
      </div>
    </div>
  );
}
