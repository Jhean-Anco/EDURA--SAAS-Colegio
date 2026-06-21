'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { esquemaAgregarDetalle, type AgregarDetalleFormValues } from '../esquemas/detalle.schema';
import type { Asignatura, DetallePlan } from '@/types/curriculo';

interface FormularioDetalleProps {
  abierto: boolean;
  onCerrar: () => void;
  asignaturas: Asignatura[];
  detalleInicial?: DetallePlan;
  isPending: boolean;
  asignaturasEnUso: string[];
  onSubmit: (data: AgregarDetalleFormValues) => Promise<void>;
}

const TIPOS = [
  { valor: 'OBLIGATORIA', etiqueta: 'Obligatoria' },
  { valor: 'ELECTIVA', etiqueta: 'Electiva' },
] as const;

export function FormularioDetalle({
  abierto,
  onCerrar,
  asignaturas,
  detalleInicial,
  isPending,
  asignaturasEnUso,
  onSubmit,
}: FormularioDetalleProps): React.JSX.Element {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AgregarDetalleFormValues>({
    resolver: zodResolver(esquemaAgregarDetalle),
    defaultValues: {
      idAsignatura: detalleInicial?.idAsignatura ?? '',
      tipo: detalleInicial?.tipo ?? 'OBLIGATORIA',
      horasSemanales: detalleInicial?.horasSemanales ?? ('' as unknown as number),
      horasAnuales: detalleInicial?.horasAnuales ?? ('' as unknown as number),
      orden: detalleInicial?.orden ?? ('' as unknown as number),
      observacion: detalleInicial?.observacion ?? null,
    },
  });

  useEffect(() => {
    if (abierto) {
      reset({
        idAsignatura: detalleInicial?.idAsignatura ?? '',
        tipo: detalleInicial?.tipo ?? 'OBLIGATORIA',
        horasSemanales: detalleInicial?.horasSemanales ?? ('' as unknown as number),
        horasAnuales: detalleInicial?.horasAnuales ?? ('' as unknown as number),
        orden: detalleInicial?.orden ?? ('' as unknown as number),
        observacion: detalleInicial?.observacion ?? null,
      });
    }
  }, [abierto, detalleInicial, reset]);

  const esEdicion = Boolean(detalleInicial);

  const disponibles = asignaturas.filter(
    (a) =>
      a.estado === 'ACTIVA' &&
      (a.id === detalleInicial?.idAsignatura || !asignaturasEnUso.includes(a.id)),
  );

  return (
    <Dialog open={abierto} onOpenChange={(open) => { if (!open) onCerrar(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar asignatura' : 'Agregar asignatura'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="det-asignatura">
              Asignatura <span aria-hidden>*</span>
            </Label>
            <Controller
              name="idAsignatura"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={esEdicion}
                >
                  <SelectTrigger
                    id="det-asignatura"
                    aria-describedby={errors.idAsignatura ? 'det-asig-error' : undefined}
                    aria-invalid={Boolean(errors.idAsignatura)}
                  >
                    <SelectValue placeholder="Selecciona una asignatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {disponibles.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nombre}
                        {a.nombreCorto ? ` (${a.nombreCorto})` : ''} — {a.nombreArea}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.idAsignatura && (
              <p id="det-asig-error" role="alert" className="text-xs text-red-600">
                {errors.idAsignatura.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="det-tipo">
                Tipo <span aria-hidden>*</span>
              </Label>
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="det-tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS.map((t) => (
                        <SelectItem key={t.valor} value={t.valor}>
                          {t.etiqueta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="det-orden">
                Orden <span aria-hidden>*</span>
              </Label>
              <Input
                id="det-orden"
                type="number"
                min={1}
                {...register('orden', { valueAsNumber: true })}
                aria-describedby={errors.orden ? 'det-orden-error' : undefined}
                aria-invalid={Boolean(errors.orden)}
              />
              {errors.orden && (
                <p id="det-orden-error" role="alert" className="text-xs text-red-600">
                  {errors.orden.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="det-horas-sem">
                Hrs. semanales <span aria-hidden>*</span>
              </Label>
              <Input
                id="det-horas-sem"
                type="number"
                min={1}
                {...register('horasSemanales', { valueAsNumber: true })}
                aria-describedby={errors.horasSemanales ? 'det-hsem-error' : undefined}
                aria-invalid={Boolean(errors.horasSemanales)}
              />
              {errors.horasSemanales && (
                <p id="det-hsem-error" role="alert" className="text-xs text-red-600">
                  {errors.horasSemanales.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="det-horas-anu">
                Hrs. anuales <span aria-hidden>*</span>
              </Label>
              <Input
                id="det-horas-anu"
                type="number"
                min={1}
                {...register('horasAnuales', { valueAsNumber: true })}
                aria-describedby={errors.horasAnuales ? 'det-hanu-error' : undefined}
                aria-invalid={Boolean(errors.horasAnuales)}
              />
              {errors.horasAnuales && (
                <p id="det-hanu-error" role="alert" className="text-xs text-red-600">
                  {errors.horasAnuales.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="det-obs">Observación</Label>
            <Input id="det-obs" {...register('observacion')} placeholder="Opcional" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCerrar} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
