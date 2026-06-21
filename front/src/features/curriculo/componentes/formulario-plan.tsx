'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { esquemaCrearPlan, type CrearPlanFormValues } from '../esquemas/plan.schema';
import type { AnioAcademico, GradoEducativo, PlanEstudio } from '@/types/curriculo';

interface FormularioPlanProps {
  anios: AnioAcademico[];
  grados: GradoEducativo[];
  planInicial?: PlanEstudio;
  isPending: boolean;
  onSubmit: (data: CrearPlanFormValues) => Promise<void>;
  onCancelar: () => void;
}

export function FormularioPlan({
  anios,
  grados,
  planInicial,
  isPending,
  onSubmit,
  onCancelar,
}: FormularioPlanProps): React.JSX.Element {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<CrearPlanFormValues>({
    resolver: zodResolver(esquemaCrearPlan),
    defaultValues: {
      idAnioAcademico: planInicial?.idAnioAcademico ?? '',
      idGradoEducativo: planInicial?.idGradoEducativo ?? '',
      codigo: planInicial?.codigo ?? '',
      nombre: planInicial?.nombre ?? '',
      observacion: planInicial?.observacion ?? null,
    },
  });

  useEffect(() => {
    if (planInicial) {
      reset({
        idAnioAcademico: planInicial.idAnioAcademico,
        idGradoEducativo: planInicial.idGradoEducativo,
        codigo: planInicial.codigo,
        nombre: planInicial.nombre,
        observacion: planInicial.observacion,
      });
    }
  }, [planInicial, reset]);

  // Advertir al usuario si intenta salir con cambios sin guardar
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const esEdicion = Boolean(planInicial);
  const anioSeleccionado = watch('idAnioAcademico');
  const gradoSeleccionado = watch('idGradoEducativo');

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Año y grado: inmutables tras salir de BORRADOR */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="plan-anio">
            Año académico <span aria-hidden>*</span>
          </Label>
          <Select
            value={anioSeleccionado}
            onValueChange={(v) => setValue('idAnioAcademico', v, { shouldValidate: true })}
            disabled={esEdicion}
          >
            <SelectTrigger
              id="plan-anio"
              aria-describedby={errors.idAnioAcademico ? 'plan-anio-error' : undefined}
              aria-invalid={Boolean(errors.idAnioAcademico)}
            >
              <SelectValue placeholder="Selecciona un año" />
            </SelectTrigger>
            <SelectContent>
              {anios.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.anio} — {a.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.idAnioAcademico && (
            <p id="plan-anio-error" role="alert" className="text-xs text-red-600">
              {errors.idAnioAcademico.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="plan-grado">
            Grado educativo <span aria-hidden>*</span>
          </Label>
          <Select
            value={gradoSeleccionado}
            onValueChange={(v) => setValue('idGradoEducativo', v, { shouldValidate: true })}
            disabled={esEdicion}
          >
            <SelectTrigger
              id="plan-grado"
              aria-describedby={errors.idGradoEducativo ? 'plan-grado-error' : undefined}
              aria-invalid={Boolean(errors.idGradoEducativo)}
            >
              <SelectValue placeholder="Selecciona un grado" />
            </SelectTrigger>
            <SelectContent>
              {grados.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.nombreNivel} — {g.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.idGradoEducativo && (
            <p id="plan-grado-error" role="alert" className="text-xs text-red-600">
              {errors.idGradoEducativo.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="plan-codigo">
            Código <span aria-hidden>*</span>
          </Label>
          <Input
            id="plan-codigo"
            {...register('codigo')}
            aria-describedby={errors.codigo ? 'plan-codigo-error' : undefined}
            aria-invalid={Boolean(errors.codigo)}
            placeholder="Ej. PE-2025-1PRI"
          />
          {errors.codigo && (
            <p id="plan-codigo-error" role="alert" className="text-xs text-red-600">
              {errors.codigo.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="plan-nombre">
            Nombre <span aria-hidden>*</span>
          </Label>
          <Input
            id="plan-nombre"
            {...register('nombre')}
            aria-describedby={errors.nombre ? 'plan-nombre-error' : undefined}
            aria-invalid={Boolean(errors.nombre)}
            placeholder="Ej. Plan de estudios 1er grado 2025"
          />
          {errors.nombre && (
            <p id="plan-nombre-error" role="alert" className="text-xs text-red-600">
              {errors.nombre.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="plan-observacion">Observaciones</Label>
        <textarea
          id="plan-observacion"
          {...register('observacion')}
          rows={3}
          placeholder="Observaciones opcionales sobre el plan…"
          className="w-full rounded-md border border-[--color-border] bg-[--color-surface] px-3 py-2 text-sm placeholder:text-[--color-text-muted] focus:outline-none focus:ring-2 focus:ring-[--color-brand-500] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      {/* Resumen de errores para lectores de pantalla */}
      {Object.keys(errors).length > 0 && (
        <div role="alert" aria-live="polite" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          Corrige los errores indicados antes de continuar.
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancelar} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear plan'}
        </Button>
      </div>
    </form>
  );
}
