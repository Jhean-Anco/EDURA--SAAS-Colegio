'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usarDocentes } from '@/features/docentes/hooks/usar-docentes';
import { usarPersonas } from '@/features/personas/hooks/usar-personas';
import { toast } from 'sonner';

const docenteEsquema = z.object({
  idPersona: z.string().uuid('Debe ingresar un ID de Persona válido'),
  codigo: z.string().min(3, 'El código debe tener al menos 3 caracteres'),
  fechaIngreso: z.string().optional(),
  perfilProfesional: z.string().optional(),
  observacion: z.string().optional(),
});

type DocenteFormValues = z.infer<typeof docenteEsquema>;

interface ListadoDocentesClientProps {
  ctx: { institucionId: string; ambito: string; sedeId: string | null };
  permisos: string[];
}

export function ListadoDocentesClient({ ctx: _ctx, permisos }: ListadoDocentesClientProps) {
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);

  const {
    docentes,
    estaCargando,
    registrar,
    estaRegistrando,
    cambiarEstado,
  } = usarDocentes(busqueda, estado, pagina);

  const { personas } = usarPersonas('', 1); // Personas de la institución para autocompletar

  const puedeCrear = permisos.includes('DOCENTES.CREAR');
  const puedeEditar = permisos.includes('DOCENTES.ACTUALIZAR');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocenteFormValues>({
    resolver: zodResolver(docenteEsquema),
  });

  const onSubmit = async (valores: DocenteFormValues) => {
    try {
      await registrar(valores);
      toast.success('Docente registrado correctamente');
      reset();
      setMostrarModal(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al registrar docente');
    }
  };

  const handleCambiarEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'CESADO' : 'ACTIVO';
    try {
      await cambiarEstado({ id, estado: nuevoEstado });
      toast.success('Estado del docente actualizado');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Docentes de la Sede</h1>
          <p className="text-muted-foreground">Listado de profesores adscritos y su información académica.</p>
        </div>
        {puedeCrear && (
          <button
            onClick={() => setMostrarModal(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
          >
            Registrar Docente
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
          className="max-w-xs rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        />
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value);
            setPagina(1);
          }}
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activos</option>
          <option value="CESADO">Cesados</option>
        </select>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Código</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Docente</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Perfil Profesional</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
                {puedeEditar && <th className="h-12 px-4 text-right align-middle font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {docentes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center align-middle text-muted-foreground">
                    No se encontraron docentes adscritos a esta sede.
                  </td>
                </tr>
              ) : (
                docentes.map((doc) => (
                  <tr key={doc.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{doc.codigo}</td>
                    <td className="p-4 align-middle">
                      {doc.persona.apellidoPaterno} {doc.persona.apellidoMaterno}, {doc.persona.nombres}
                    </td>
                    <td className="p-4 align-middle">{doc.perfilProfesional || '—'}</td>
                    <td className="p-4 align-middle">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          doc.estado === 'ACTIVO' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                        }`}
                      >
                        {doc.estado}
                      </span>
                    </td>
                    {puedeEditar && (
                      <td className="p-4 align-middle text-right">
                        <button
                          onClick={() => handleCambiarEstado(doc.id, doc.estado)}
                          className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted"
                        >
                          {doc.estado === 'ACTIVO' ? 'Cesar' : 'Activar'}
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
            <h2 className="text-lg font-bold">Registrar Docente</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Asociar Persona</label>
                <select
                  {...register('idPersona')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="">Seleccione una persona...</option>
                  {personas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.apellidoPaterno} {p.apellidoMaterno}, {p.nombres}
                    </option>
                  ))}
                </select>
                {errors.idPersona && <span className="text-xs text-destructive">{errors.idPersona.message}</span>}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Código Docente</label>
                <input
                  type="text"
                  placeholder="Ej. DOC-2026-001"
                  {...register('codigo')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.codigo && <span className="text-xs text-destructive">{errors.codigo.message}</span>}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Perfil Profesional</label>
                <input
                  type="text"
                  placeholder="Ej. Licenciado en Matemática"
                  {...register('perfilProfesional')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Fecha Ingreso (Opcional)</label>
                <input
                  type="text"
                  placeholder="AAAA-MM-DD"
                  {...register('fechaIngreso')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Observación (Opcional)</label>
                <textarea
                  {...register('observacion')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
                  disabled={estaRegistrando}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
                >
                  {estaRegistrando ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
