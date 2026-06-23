'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usarSecciones } from '@/features/estructura-academica/hooks/usar-secciones';
import type { OfertaAcademica, SeccionAcademica } from '@/features/estructura-academica/hooks/usar-secciones';
import { usarCalendario } from '@/features/estructura-academica/hooks/usar-calendario';
import { toast } from 'sonner';

const seccionEsquema = z.object({
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  capacidadMaxima: z.coerce.number().min(1, 'La capacidad máxima debe ser de al menos 1 estudiante'),
});

type SeccionFormValues = z.infer<typeof seccionEsquema>;

interface SeccionesClientProps {
  ctx: { institucionId: string; ambito: string; sedeId: string | null };
  permisos: string[];
}

export function SeccionesClient({ ctx: _ctx, permisos }: SeccionesClientProps) {
  const { anios } = usarCalendario('ACTIVO'); // Cargar años activos de la institución
  const [anioSeleccionado, setAnioSeleccionado] = useState('');
  const { ofertas, crearSeccion, usarDetalleSecciones } = usarSecciones(anioSeleccionado);

  const [modalSeccionOfertaId, setModalSeccionOfertaId] = useState<string | null>(null);
  const puedeGestionar = permisos.includes('ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SeccionFormValues>({
    resolver: zodResolver(seccionEsquema),
    defaultValues: {
      capacidadMaxima: 30,
    },
  });

  const onSubmitSeccion = async (valores: SeccionFormValues) => {
    if (!modalSeccionOfertaId) return;
    try {
      await crearSeccion({
        idOferta: modalSeccionOfertaId,
        codigo: valores.codigo,
        nombre: valores.nombre,
        capacidadMaxima: valores.capacidadMaxima,
      });
      toast.success('Sección registrada correctamente');
      reset();
      setModalSeccionOfertaId(null);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al crear sección');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Oferta y Secciones Académicas</h1>
          <p className="text-muted-foreground">Distribución de grados, secciones y tutorías de la sede.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Año Académico:</label>
        <select
          value={anioSeleccionado}
          onChange={(e) => setAnioSeleccionado(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        >
          <option value="">Seleccione año lectivo...</option>
          {anios.map((an) => (
            <option key={an.id} value={an.id}>
              {an.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6">
        {ofertas.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
            {anioSeleccionado
              ? 'No hay ofertas académicas configuradas para este año.'
              : 'Seleccione un año académico para ver la oferta y secciones.'}
          </div>
        ) : (
          ofertas.map((of) => (
            <OfertaItem
              key={of.id}
              oferta={of}
              puedeGestionar={puedeGestionar}
              onCrearSeccion={() => setModalSeccionOfertaId(of.id)}
              usarDetalleSecciones={usarDetalleSecciones}
            />
          ))
        )}
      </div>

      {modalSeccionOfertaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-bold">Crear Sección Académica</h2>
            <form onSubmit={handleSubmit(onSubmitSeccion)} className="mt-4 space-y-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Código</label>
                <input
                  type="text"
                  placeholder="Ej. SEC-A"
                  {...register('codigo')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.codigo && <span className="text-xs text-destructive">{errors.codigo.message}</span>}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Nombre de la Sección</label>
                <input
                  type="text"
                  placeholder="Ej. Sección A"
                  {...register('nombre')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.nombre && <span className="text-xs text-destructive">{errors.nombre.message}</span>}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Capacidad Máxima</label>
                <input
                  type="number"
                  {...register('capacidadMaxima')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.capacidadMaxima && (
                  <span className="text-xs text-destructive">{errors.capacidadMaxima.message}</span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSeccionOfertaId(null)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
                >
                  Crear Sección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface OfertaItemProps {
  oferta: OfertaAcademica;
  puedeGestionar: boolean;
  onCrearSeccion: () => void;
  usarDetalleSecciones: (idOferta: string) => { data?: SeccionAcademica[]; isLoading: boolean };
}

function OfertaItem({ oferta, puedeGestionar, onCrearSeccion, usarDetalleSecciones }: OfertaItemProps) {
  const { data: secciones = [], isLoading } = usarDetalleSecciones(oferta.id);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="font-semibold text-lg">{oferta.grado?.nombre || 'Grado'}</h3>
          <span className="text-xs text-muted-foreground">ID Oferta: {oferta.id}</span>
        </div>
        {puedeGestionar && (
          <button
            onClick={onCrearSeccion}
            className="rounded border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Añadir Sección
          </button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Cargando secciones...</p>
        ) : secciones.length === 0 ? (
          <p className="text-xs text-muted-foreground">No hay secciones registradas bajo esta oferta.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {secciones.map((sec: SeccionAcademica) => (
              <div key={sec.id} className="rounded-lg border p-3 text-sm space-y-1 bg-muted/30">
                <div className="flex items-center justify-between font-medium">
                  <span>{sec.nombre}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      sec.estado === 'ACTIVA' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {sec.estado}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Código: {sec.codigo}</p>
                <p className="text-xs text-muted-foreground">Capacidad: {sec.capacidadMaxima} alumnos</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
