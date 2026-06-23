'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usarCalendario } from '@/features/estructura-academica/hooks/usar-calendario';
import { toast } from 'sonner';

const anioEsquema = z.object({
  nombre: z.string().min(4, 'El nombre debe tener al menos 4 caracteres'),
  fechaInicio: z.string().min(10, 'Ingrese fecha de inicio (AAAA-MM-DD)'),
  fechaFin: z.string().min(10, 'Ingrese fecha de fin (AAAA-MM-DD)'),
});

type AnioFormValues = z.infer<typeof anioEsquema>;

interface CalendarioClientProps {
  ctx: { institucionId: string; ambito: string; sedeId: string | null };
  permisos: string[];
}

export function CalendarioClient({ ctx: _ctx, permisos }: CalendarioClientProps) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const { anios, estaCargando, crear, estaCreando } = usarCalendario();

  const puedeGestionar = permisos.includes('ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnioFormValues>({
    resolver: zodResolver(anioEsquema),
  });

  const onSubmit = async (valores: AnioFormValues) => {
    try {
      await crear(valores);
      toast.success('Año académico creado');
      reset();
      setMostrarModal(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al crear año');
    }
  };

  if (estaCargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario Académico</h1>
          <p className="text-muted-foreground">Planificación y apertura de años y períodos lectivos de la institución.</p>
        </div>
        {puedeGestionar && (
          <button
            onClick={() => setMostrarModal(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
          >
            Abrir Año Académico
          </button>
        )}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Año</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Inicio</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Cierre</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {anios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-24 text-center align-middle text-muted-foreground">
                    No se han registrado años académicos.
                  </td>
                </tr>
              ) : (
                anios.map((an) => (
                  <tr key={an.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{an.nombre}</td>
                    <td className="p-4 align-middle">{an.fechaInicio}</td>
                    <td className="p-4 align-middle">{an.fechaFin}</td>
                    <td className="p-4 align-middle">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          an.estado === 'ACTIVO' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {an.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-bold">Abrir Año Académico</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Nombre (Ej. Año Lectivo 2026)</label>
                <input
                  type="text"
                  {...register('nombre')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.nombre && <span className="text-xs text-destructive">{errors.nombre.message}</span>}
              </div>

              <div className="grid gap-2 grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Fecha Inicio</label>
                  <input
                    type="text"
                    placeholder="AAAA-MM-DD"
                    {...register('fechaInicio')}
                    className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.fechaInicio && (
                    <span className="text-xs text-destructive">{errors.fechaInicio.message}</span>
                  )}
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Fecha Cierre</label>
                  <input
                    type="text"
                    placeholder="AAAA-MM-DD"
                    {...register('fechaFin')}
                    className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.fechaFin && <span className="text-xs text-destructive">{errors.fechaFin.message}</span>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={estaCreando}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
                >
                  {estaCreando ? 'Ariendo...' : 'Abrir Año'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
