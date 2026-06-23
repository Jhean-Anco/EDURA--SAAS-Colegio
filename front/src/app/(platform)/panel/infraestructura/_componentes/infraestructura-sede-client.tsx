'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usarInfraestructura } from '@/features/infraestructura/hooks/usar-infraestructura';
import { toast } from 'sonner';

const servicioEsquema = z.object({
  tipoServicioCodigo: z.string().min(2, 'Debe ingresar el código de tipo de servicio'),
  proveedor: z.string().optional(),
  numeroSuministro: z.string().optional(),
});

type ServicioFormValues = z.infer<typeof servicioEsquema>;

interface InfraestructuraSedeClientProps {
  ctx: { institucionId: string; ambito: string; sedeId: string | null };
  permisos: string[];
}

export function InfraestructuraSedeClient({ ctx, permisos }: InfraestructuraSedeClientProps) {
  const {
    elementos,
    servicios,
    estaCargando,
    error,
    registrarServicio,
    estaRegistrandoServicio,
  } = usarInfraestructura(ctx.sedeId || undefined);

  const [mostrarModal, setMostrarModal] = useState(false);
  const puedeGestionar = permisos.includes('INFRAESTRUCTURA.GESTIONAR');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServicioFormValues>({
    resolver: zodResolver(servicioEsquema),
  });

  const onSubmit = async (valores: ServicioFormValues) => {
    try {
      await registrarServicio(valores);
      toast.success('Servicio básico registrado');
      reset();
      setMostrarModal(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al registrar servicio');
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
        <p>{error.message || 'No se pudo cargar la infraestructura'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Infraestructura Física y Servicios</h1>
        <p className="text-muted-foreground">Distribución física, predios, aulas y estado de servicios básicos de la sede.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna de Espacios Físicos */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Espacios y Aulas</h2>
          <p className="text-sm text-muted-foreground">Estructura física jerárquica de la sede.</p>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {elementos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay elementos físicos registrados en esta sede.</p>
            ) : (
              elementos.map((el) => (
                <div key={el.id} className="flex items-center justify-between border-b pb-2 text-sm">
                  <div>
                    <span className="font-medium text-foreground">{el.nombre}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({el.codigo})</span>
                  </div>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {el.estado}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna de Servicios Básicos */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Servicios Básicos</h2>
            {puedeGestionar && (
              <button
                onClick={() => setMostrarModal(true)}
                className="rounded border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Añadir Servicio
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Servicios de suministro asociados a la sede.</p>

          <div className="space-y-3">
            {servicios.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay servicios básicos registrados.</p>
            ) : (
              servicios.map((ser) => (
                <div key={ser.id} className="rounded-lg border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span>{ser.tipoServicioCodigo}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        ser.estadoServicio === 'ACTIVO' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {ser.estadoServicio}
                    </span>
                  </div>
                  {ser.proveedor && <p className="text-xs text-muted-foreground">Proveedor: {ser.proveedor}</p>}
                  {ser.numeroSuministro && (
                    <p className="text-xs text-muted-foreground">Suministro N°: {ser.numeroSuministro}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-bold">Añadir Servicio Básico</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Tipo de Servicio (Código)</label>
                <input
                  type="text"
                  placeholder="Ej. AGUA, LUZ, INTERNET"
                  {...register('tipoServicioCodigo')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.tipoServicioCodigo && (
                  <span className="text-xs text-destructive">{errors.tipoServicioCodigo.message}</span>
                )}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Proveedor (Opcional)</label>
                <input
                  type="text"
                  {...register('proveedor')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">N° de Suministro (Opcional)</label>
                <input
                  type="text"
                  {...register('numeroSuministro')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={estaRegistrandoServicio}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
                >
                  {estaRegistrandoServicio ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
