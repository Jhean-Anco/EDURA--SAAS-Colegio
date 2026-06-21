'use client';

import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { usarAprobarPlan } from '../hooks/usar-mutaciones-plan';
import { traducirError } from '@/lib/errores/traducir-error';
import type { PlanEstudio } from '@/types/curriculo';
import type { ContextoDescriptor } from '@/types/auth';

type Ctx = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

interface DialogoAprobarPlanProps {
  abierto: boolean;
  onCerrar: () => void;
  plan: PlanEstudio;
  ctx: Ctx;
}

export function DialogoAprobarPlan({
  abierto,
  onCerrar,
  plan,
  ctx,
}: DialogoAprobarPlanProps): React.JSX.Element {
  const { mutateAsync, isPending } = usarAprobarPlan(ctx, plan.id);

  const handleAprobar = async () => {
    try {
      await mutateAsync();
      toast.success('Plan aprobado correctamente. Ya no es editable.');
      onCerrar();
    } catch (err) {
      toast.error(traducirError(err));
    }
  };

  return (
    <AlertDialog open={abierto} onOpenChange={(open) => { if (!open) onCerrar(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Aprobar plan de estudio</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Estás por aprobar <strong>{plan.nombre}</strong> ({plan.anio} —{' '}
                {plan.nombreGrado}).
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>El plan contiene {plan.totalAsignaturasActivas} asignatura(s) activa(s).</li>
                <li>
                  Total horas semanales: <strong>{plan.totalHorasSemanales}</strong> /
                  anuales: <strong>{plan.totalHorasAnuales}</strong>.
                </li>
                <li className="text-amber-700 dark:text-amber-400 font-medium">
                  Una vez aprobado, el plan no podrá ser editado.
                </li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAprobar}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500"
          >
            {isPending ? 'Aprobando…' : 'Aprobar plan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
