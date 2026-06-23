'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usarInstitucion } from '@/features/institucion/hooks/usar-institucion';
import { toast } from 'sonner';

const institucionEsquema = z.object({
  nombreLegal: z.string().min(3, 'El nombre legal debe tener al menos 3 caracteres'),
  nombreCorto: z.string().optional(),
  tipoGestion: z.enum(['PUBLICA', 'PRIVADA', 'CONVENIO']).optional(),
});

type InstitucionFormValues = z.infer<typeof institucionEsquema>;

interface FichaInstitucionClientProps {
  ctx: { institucionId: string; ambito: string; sedeId: string | null };
  permisos: string[];
}

export function FichaInstitucionClient({ ctx, permisos }: FichaInstitucionClientProps) {
  const { institucion, estaCargando, error, actualizar, estaActualizando } = usarInstitucion(ctx.institucionId);
  const puedeEditar = permisos.includes('INSTITUCIONES.ACTUALIZAR');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstitucionFormValues>({
    resolver: zodResolver(institucionEsquema),
    values: institucion
      ? {
          nombreLegal: institucion.nombreLegal,
          nombreCorto: institucion.nombreCorto || '',
          tipoGestion: (institucion.tipoGestion as 'PUBLICA' | 'PRIVADA' | 'CONVENIO') || 'PUBLICA',
        }
      : undefined,
  });

  const onSubmit = async (valores: InstitucionFormValues) => {
    try {
      await actualizar(valores);
      toast.success('Institución actualizada correctamente');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al actualizar los datos');
    }
  };

  if (estaCargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/15 p-4 text-destructive">
        <h3 className="font-bold">Error</h3>
        <p>{error.message || 'No se pudo cargar la institución'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ficha Institucional</h1>
        <p className="text-muted-foreground">Datos legales e identidad principal de la institución educativa.</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Código Modular</label>
            <input
              type="text"
              disabled
              value={institucion?.codigo || ''}
              className="rounded-md border bg-muted px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Nombre Legal</label>
            <input
              type="text"
              disabled={!puedeEditar}
              {...register('nombreLegal')}
              className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.nombreLegal && (
              <span className="text-xs text-destructive">{errors.nombreLegal.message}</span>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Nombre Corto / Comercial</label>
            <input
              type="text"
              disabled={!puedeEditar}
              {...register('nombreCorto')}
              className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Tipo de Gestión</label>
            <select
              disabled={!puedeEditar}
              {...register('tipoGestion')}
              className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="PUBLICA">Pública</option>
              <option value="PRIVADA">Privada</option>
              <option value="CONVENIO">Convenio</option>
            </select>
          </div>

          {puedeEditar && (
            <button
              type="submit"
              disabled={estaActualizando}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95 disabled:opacity-50"
            >
              {estaActualizando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
