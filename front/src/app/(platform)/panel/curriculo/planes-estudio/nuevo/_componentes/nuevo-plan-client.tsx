'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormularioPlan } from '@/features/curriculo/componentes/formulario-plan';
import { usarCrearPlan } from '@/features/curriculo/hooks/usar-mutaciones-plan';
import { usarAnios } from '@/features/curriculo/hooks/usar-anios';
import { usarGrados } from '@/features/curriculo/hooks/usar-grados';
import { traducirError } from '@/lib/errores/traducir-error';
import type { CrearPlanFormValues } from '@/features/curriculo/esquemas/plan.schema';
import type { Ambito } from '@/types/auth';

interface Ctx {
  institucionId: string;
  ambito: Ambito;
  sedeId: string | null;
}

export function NuevoPlanClient({ ctx }: { ctx: Ctx }): React.JSX.Element {
  const router = useRouter();
  const { data: anios = [] } = usarAnios(ctx, 'ACTIVO');
  const { data: grados = [] } = usarGrados(ctx, undefined, 'ACTIVO');
  const { mutateAsync, isPending } = usarCrearPlan(ctx);

  const onSubmit = async (data: CrearPlanFormValues) => {
    try {
      const resultado = await mutateAsync(data);
      toast.success('Plan de estudio creado correctamente');
      router.push(`/panel/curriculo/planes-estudio/${resultado.id}`);
    } catch (err) {
      toast.error(traducirError(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/panel/curriculo/planes-estudio">
            <ChevronLeft className="h-4 w-4" />
            Volver al listado
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-[--color-text-primary]">Nuevo plan de estudio</h1>
        <p className="text-sm text-[--color-text-secondary]">
          Crea un nuevo plan curricular en estado Borrador.
        </p>
      </div>

      <div className="rounded-lg border border-[--color-border] bg-[--color-surface] p-6">
        <FormularioPlan
          anios={anios}
          grados={grados}
          isPending={isPending}
          onSubmit={onSubmit}
          onCancelar={() => router.push('/panel/curriculo/planes-estudio')}
        />
      </div>
    </div>
  );
}
