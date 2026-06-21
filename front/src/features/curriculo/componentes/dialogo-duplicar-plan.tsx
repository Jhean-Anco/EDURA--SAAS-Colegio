'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { esquemaDuplicarPlan, type DuplicarPlanFormValues } from '../esquemas/plan.schema';
import { usarDuplicarPlan } from '../hooks/usar-mutaciones-plan';
import { traducirError } from '@/lib/errores/traducir-error';
import type { PlanEstudioItem, AnioAcademico } from '@/types/curriculo';
import type { ContextoDescriptor } from '@/types/auth';

type Ctx = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

interface DialogoDuplicarPlanProps {
  abierto: boolean;
  onCerrar: () => void;
  plan: PlanEstudioItem;
  anios: AnioAcademico[];
  ctx: Ctx;
}

export function DialogoDuplicarPlan({
  abierto,
  onCerrar,
  plan,
  anios,
  ctx,
}: DialogoDuplicarPlanProps): React.JSX.Element {
  const router = useRouter();
  const { mutateAsync, isPending } = usarDuplicarPlan(ctx, plan.id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<DuplicarPlanFormValues>({
    resolver: zodResolver(esquemaDuplicarPlan),
    defaultValues: {
      nombre: `${plan.nombre} (copia)`,
      codigo: '',
      observacion: null,
    },
  });

  const cerrar = () => {
    reset();
    onCerrar();
  };

  const onSubmit = async (data: DuplicarPlanFormValues) => {
    try {
      const resultado = await mutateAsync(data);
      toast.success('Plan duplicado correctamente');
      cerrar();
      router.push(`/panel/curriculo/planes-estudio/${resultado.id}`);
    } catch (err) {
      toast.error(traducirError(err));
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => { if (!open) cerrar(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicar plan de estudio</DialogTitle>
          <DialogDescription>
            Plan origen: <strong>{plan.nombre}</strong> ({plan.anio} — {plan.nombreGrado})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="dup-anio">Año académico (opcional)</Label>
            <Select onValueChange={(v) => setValue('idAnioAcademico', v)}>
              <SelectTrigger id="dup-anio">
                <SelectValue placeholder="Mismo año que el original" />
              </SelectTrigger>
              <SelectContent>
                {anios.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.anio} — {a.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="dup-codigo">
              Código <span aria-hidden>*</span>
            </Label>
            <Input
              id="dup-codigo"
              {...register('codigo')}
              aria-describedby={errors.codigo ? 'dup-codigo-error' : undefined}
              aria-invalid={Boolean(errors.codigo)}
              placeholder="Ej. PE-2025-1PRI-V2"
            />
            {errors.codigo && (
              <p id="dup-codigo-error" role="alert" className="text-xs text-red-600">
                {errors.codigo.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="dup-nombre">
              Nombre <span aria-hidden>*</span>
            </Label>
            <Input
              id="dup-nombre"
              {...register('nombre')}
              aria-describedby={errors.nombre ? 'dup-nombre-error' : undefined}
              aria-invalid={Boolean(errors.nombre)}
            />
            {errors.nombre && (
              <p id="dup-nombre-error" role="alert" className="text-xs text-red-600">
                {errors.nombre.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrar} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Duplicando…' : 'Duplicar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
