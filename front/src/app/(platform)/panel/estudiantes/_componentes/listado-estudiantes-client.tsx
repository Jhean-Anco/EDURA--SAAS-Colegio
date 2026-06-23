'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usarEstudiantes } from '@/features/estudiantes/hooks/usar-estudiantes';
import { usarPersonas } from '@/features/personas/hooks/usar-personas';
import { toast } from 'sonner';

const estudianteEsquema = z.object({
  idPersona: z.string().uuid('Debe ingresar un ID de Persona válido'),
  codigo: z.string().min(3, 'El código debe tener al menos 3 caracteres'),
  fechaIngreso: z.string().optional(),
  observacion: z.string().optional(),
});

type EstudianteFormValues = z.infer<typeof estudianteEsquema>;

const apoderadoEsquema = z.object({
  idPersona: z.string().uuid('Debe ingresar un ID de Persona válido'),
  parentesco: z.enum(['PADRE', 'MADRE', 'TUTOR_LEGAL', 'OTROS']),
  esPrincipal: z.boolean(),
});

type ApoderadoFormValues = z.infer<typeof apoderadoEsquema>;

interface ListadoEstudiantesClientProps {
  ctx: { institucionId: string; ambito: string; sedeId: string | null };
  permisos: string[];
}

export function ListadoEstudiantesClient({ ctx: _, permisos }: ListadoEstudiantesClientProps) {
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);

  const [mostrarModalEstudiante, setMostrarModalEstudiante] = useState(false);
  const [mostrarModalApoderado, setMostrarModalApoderado] = useState<string | null>(null);

  const {
    estudiantes,
    estaCargando,
    crear,
    estaCreando,
    cambiarEstado,
    vincularApoderado,
    estaVinculandoApoderado,
  } = usarEstudiantes(busqueda, estado, pagina);

  const { personas } = usarPersonas('', 1); // Carga preliminar de personas para autocompletar

  const puedeCrear = permisos.includes('ESTUDIANTES.CREAR');
  const puedeEditar = permisos.includes('ESTUDIANTES.ACTUALIZAR');
  const puedeGestionarApoderados = permisos.includes('ESTUDIANTES.APODERADOS.GESTIONAR');

  const formEstudiante = useForm<EstudianteFormValues>({
    resolver: zodResolver(estudianteEsquema),
  });

  const formApoderado = useForm<ApoderadoFormValues>({
    resolver: zodResolver(apoderadoEsquema),
    defaultValues: {
      esPrincipal: true,
      parentesco: 'PADRE',
    },
  });

  const onSubmitEstudiante = async (valores: EstudianteFormValues) => {
    try {
      await crear(valores);
      toast.success('Estudiante registrado correctamente');
      formEstudiante.reset();
      setMostrarModalEstudiante(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al crear estudiante');
    }
  };

  const onSubmitApoderado = async (valores: ApoderadoFormValues) => {
    if (!mostrarModalApoderado) return;
    try {
      await vincularApoderado({
        idEstudiante: mostrarModalApoderado,
        idPersona: valores.idPersona,
        parentesco: valores.parentesco,
        esPrincipal: valores.esPrincipal,
      });
      toast.success('Apoderado vinculado correctamente');
      formApoderado.reset();
      setMostrarModalApoderado(null);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al vincular apoderado');
    }
  };

  const handleCambiarEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      await cambiarEstado({ id, estado: nuevoEstado });
      toast.success('Estado del estudiante actualizado');
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
          <h1 className="text-3xl font-bold tracking-tight">Estudiantes de la Sede</h1>
          <p className="text-muted-foreground">Listado de alumnos matriculados y sus responsables apoderados.</p>
        </div>
        {puedeCrear && (
          <button
            onClick={() => setMostrarModalEstudiante(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
          >
            Registrar Estudiante
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
          <option value="INACTIVO">Inactivos</option>
        </select>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Código</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Estudiante</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Ingreso</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
                <th className="h-12 px-4 text-right align-middle font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center align-middle text-muted-foreground">
                    No se encontraron estudiantes en esta sede.
                  </td>
                </tr>
              ) : (
                estudiantes.map((est) => (
                  <tr key={est.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{est.codigo}</td>
                    <td className="p-4 align-middle">
                      {est.persona.apellidoPaterno} {est.persona.apellidoMaterno}, {est.persona.nombres}
                    </td>
                    <td className="p-4 align-middle">{est.fechaIngreso || '—'}</td>
                    <td className="p-4 align-middle">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          est.estado === 'ACTIVO' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                        }`}
                      >
                        {est.estado}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right space-x-2">
                      {puedeGestionarApoderados && (
                        <button
                          onClick={() => setMostrarModalApoderado(est.id)}
                          className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted"
                        >
                          Apoderado
                        </button>
                      )}
                      {puedeEditar && (
                        <button
                          onClick={() => handleCambiarEstado(est.id, est.estado)}
                          className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted"
                        >
                          {est.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Registrar Estudiante */}
      {mostrarModalEstudiante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-bold">Registrar Estudiante</h2>
            <form onSubmit={formEstudiante.handleSubmit(onSubmitEstudiante)} className="mt-4 space-y-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Asociar Persona</label>
                <select
                  {...formEstudiante.register('idPersona')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="">Seleccione una persona...</option>
                  {personas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.apellidoPaterno} {p.apellidoMaterno}, {p.nombres}
                    </option>
                  ))}
                </select>
                {formEstudiante.formState.errors.idPersona && (
                  <span className="text-xs text-destructive">{formEstudiante.formState.errors.idPersona.message}</span>
                )}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Código Estudiante</label>
                <input
                  type="text"
                  placeholder="Ej. EST-2026-001"
                  {...formEstudiante.register('codigo')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {formEstudiante.formState.errors.codigo && (
                  <span className="text-xs text-destructive">{formEstudiante.formState.errors.codigo.message}</span>
                )}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Fecha Ingreso (Opcional)</label>
                <input
                  type="text"
                  placeholder="AAAA-MM-DD"
                  {...formEstudiante.register('fechaIngreso')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Observación (Opcional)</label>
                <textarea
                  {...formEstudiante.register('observacion')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalEstudiante(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={estaCreando}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
                >
                  {estaCreando ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Vincular Apoderado */}
      {mostrarModalApoderado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-bold">Vincular Apoderado</h2>
            <form onSubmit={formApoderado.handleSubmit(onSubmitApoderado)} className="mt-4 space-y-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Seleccionar Persona Apoderado</label>
                <select
                  {...formApoderado.register('idPersona')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="">Seleccione una persona...</option>
                  {personas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.apellidoPaterno} {p.apellidoMaterno}, {p.nombres}
                    </option>
                  ))}
                </select>
                {formApoderado.formState.errors.idPersona && (
                  <span className="text-xs text-destructive">{formApoderado.formState.errors.idPersona.message}</span>
                )}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Parentesco</label>
                <select
                  {...formApoderado.register('parentesco')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="PADRE">Padre</option>
                  <option value="MADRE">Madre</option>
                  <option value="TUTOR_LEGAL">Tutor Legal</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="esPrincipal"
                  {...formApoderado.register('esPrincipal')}
                  className="rounded border focus:ring-2 focus:ring-primary h-4 w-4 text-primary"
                />
                <label htmlFor="esPrincipal" className="text-sm font-medium">
                  ¿Es Apoderado Principal / Responsable Académico?
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalApoderado(null)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={estaVinculandoApoderado}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
                >
                  {estaVinculandoApoderado ? 'Vinculando...' : 'Vincular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
