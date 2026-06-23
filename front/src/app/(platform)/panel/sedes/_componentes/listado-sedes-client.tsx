'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usarSedes } from '@/features/institucion/hooks/usar-sedes';
import { toast } from 'sonner';

const sedeEsquema = z.object({
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
});

type SedeFormValues = z.infer<typeof sedeEsquema>;

interface ListadoSedesClientProps {
  ctx: { institucionId: string; ambito: string; sedeId: string | null };
  permisos: string[];
}

export function ListadoSedesClient({ ctx, permisos }: ListadoSedesClientProps) {
  const {
    sedes,
    estaCargando,
    error,
    crear,
    estaCreando,
    establecerPrincipal,
    cambiarEstado,
  } = usarSedes(ctx.institucionId);

  const [mostrarModal, setMostrarModal] = useState(false);
  const puedeCrear = permisos.includes('SEDES.CREAR');
  const puedeEditar = permisos.includes('SEDES.ACTUALIZAR');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SedeFormValues>({
    resolver: zodResolver(sedeEsquema),
  });

  const onSubmit = async (valores: SedeFormValues) => {
    try {
      await crear(valores);
      toast.success('Sede creada correctamente');
      reset();
      setMostrarModal(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al crear la sede');
    }
  };

  const handleEstablecerPrincipal = async (idSede: string) => {
    try {
      await establecerPrincipal(idSede);
      toast.success('Sede establecida como principal');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al actualizar');
    }
  };

  const handleCambiarEstado = async (idSede: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    try {
      await cambiarEstado({ idSede, estado: nuevoEstado });
      toast.success('Estado de la sede actualizado');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al cambiar estado');
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
        <p>{error.message || 'No se pudieron cargar las sedes'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sedes de la Institución</h1>
          <p className="text-muted-foreground">Listado y gestión operativa de sedes educativas.</p>
        </div>
        {puedeCrear && (
          <button
            onClick={() => setMostrarModal(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
          >
            Nueva Sede
          </button>
        )}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50 transition-colors">
                <th className="h-12 px-4 text-left align-middle font-medium">Código</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Nombre</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Principal</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
                {puedeEditar && <th className="h-12 px-4 text-right align-middle font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {sedes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center align-middle text-muted-foreground">
                    No hay sedes registradas.
                  </td>
                </tr>
              ) : (
                sedes.map((sede) => (
                  <tr key={sede.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{sede.codigo}</td>
                    <td className="p-4 align-middle">{sede.nombre}</td>
                    <td className="p-4 align-middle">
                      {sede.esPrincipal ? (
                        <span className="rounded bg-success/15 px-2 py-1 text-xs font-semibold text-success">
                          Sí
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          sede.estado === 'ACTIVA' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                        }`}
                      >
                        {sede.estado}
                      </span>
                    </td>
                    {puedeEditar && (
                      <td className="p-4 align-middle text-right space-x-2">
                        {!sede.esPrincipal && sede.estado === 'ACTIVA' && (
                          <button
                            onClick={() => handleEstablecerPrincipal(sede.id)}
                            className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted"
                          >
                            Hacer Principal
                          </button>
                        )}
                        <button
                          onClick={() => handleCambiarEstado(sede.id, sede.estado)}
                          className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted"
                        >
                          {sede.estado === 'ACTIVA' ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    )}
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
            <h2 className="text-lg font-bold">Crear Nueva Sede</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Código</label>
                <input
                  type="text"
                  {...register('codigo')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.codigo && <span className="text-xs text-destructive">{errors.codigo.message}</span>}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Nombre de la Sede</label>
                <input
                  type="text"
                  {...register('nombre')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.nombre && <span className="text-xs text-destructive">{errors.nombre.message}</span>}
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
                  disabled={estaCreando}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
                >
                  {estaCreando ? 'Creando...' : 'Crear Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
