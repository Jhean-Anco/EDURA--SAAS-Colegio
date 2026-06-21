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
import { usarCambiarEstadoPlan } from '../hooks/usar-mutaciones-plan';
import { traducirError } from '@/lib/errores/traducir-error';
import type { EstadoPlan, PlanEstudio } from '@/types/curriculo';
import type { ContextoDescriptor } from '@/types/auth';

type Ctx = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

const ETIQUETAS: Record<EstadoPlan, string> = {
  BORRADOR: 'Borrador',
  APROBADO: 'Aprobado',
  VIGENTE: 'Vigente',
  CERRADO: 'Cerrado',
  ANULADO: 'Anulado',
};

const ADVERTENCIAS: Partial<Record<EstadoPlan, string>> = {
  VIGENTE: 'Solo puede existir un plan vigente para el mismo año y grado.',
  CERRADO: 'El plan quedará cerrado y no podrá reactivarse.',
  ANULADO: 'El plan quedará anulado permanentemente.',
};

interface DialogoCambiarEstadoPlanProps {
  abierto: boolean;
  onCerrar: () => void;
  plan: PlanEstudio;
  estadoDestino: EstadoPlan;
  ctx: Ctx;
}

export function DialogoCambiarEstadoPlan({
  abierto,
  onCerrar,
  plan,
  estadoDestino,
  ctx,
}: DialogoCambiarEstadoPlanProps): React.JSX.Element {
  const { mutateAsync, isPending } = usarCambiarEstadoPlan(ctx, plan.id);

  const esDestructivo = estadoDestino === 'ANULADO' || estadoDestino === 'CERRADO';

  const handleCambiar = async () => {
    try {
      await mutateAsync({ estado: estadoDestino });
      toast.success(`Estado cambiado a "${ETIQUETAS[estadoDestino]}"`);
      onCerrar();
    } catch (err) {
      toast.error(traducirError(err));
    }
  };

  return (
    <AlertDialog open={abierto} onOpenChange={(open) => { if (!open) onCerrar(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Cambiar estado a &ldquo;{ETIQUETAS[estadoDestino]}&rdquo;
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Plan: <strong>{plan.nombre}</strong>
              </p>
              <p>
                Estado actual: <strong>{ETIQUETAS[plan.estado]}</strong> → Nuevo estado:{' '}
                <strong>{ETIQUETAS[estadoDestino]}</strong>
              </p>
              {ADVERTENCIAS[estadoDestino] && (
                <p className="text-amber-700 dark:text-amber-400 font-medium">
                  ⚠ {ADVERTENCIAS[estadoDestino]}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCambiar}
            disabled={isPending}
            className={
              esDestructivo
                ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
                : 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500'
            }
          >
            {isPending ? 'Cambiando…' : `Pasar a ${ETIQUETAS[estadoDestino]}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
