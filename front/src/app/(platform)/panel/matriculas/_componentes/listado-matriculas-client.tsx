'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usarMatriculas } from '@/features/matriculas/hooks/usar-matriculas';
import { usarEstudiantes } from '@/features/estudiantes/hooks/usar-estudiantes';
import { usarSecciones } from '@/features/estructura-academica/hooks/usar-secciones';
import { usarCalendario } from '@/features/estructura-academica/hooks/usar-calendario';
import { toast } from 'sonner';

const matriculaEsquema = z.object({
  idEstudiante: z.string().uuid('Debe ingresar un ID de Estudiante válido'),
  idOfertaGradoSede: z.string().uuid('Debe seleccionar una Oferta Académica'),
  idSeccionAcademica: z.string().uuid('Debe seleccionar una Sección'),
  fechaMatricula: z.string().min(10, 'Ingrese la fecha de matrícula (AAAA-MM-DD)'),
});

type MatriculaFormValues = z.infer<typeof matriculaEsquema>;

interface ListadoMatriculasClientProps {
  ctx: { institucionId: string; ambito: string; sedeId: string | null };
  permisos: string[];
}

export function ListadoMatriculasClient({ ctx: _, permisos }: ListadoMatriculasClientProps) {
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);

  const { anios } = usarCalendario('ACTIVO'); // Cargar años activos
  const [idAnio, setIdAnio] = useState('');

  const { matriculas, estaCargando, registrar, estaRegistrando, activar, anular } = usarMatriculas(estado, pagina);
  const { estudiantes } = usarEstudiantes('', 'ACTIVO', 1); // Estudiantes activos disponibles
  const { ofertas, usarDetalleSecciones } = usarSecciones(idAnio, 'ACTIVA'); // Ofertas activas

  const puedeGestionar = permisos.includes('MATRICULAS.GESTIONAR');
  const puedeActivar = permisos.includes('MATRICULAS.ACTIVAR');
  const puedeAnular = permisos.includes('MATRICULAS.ANULAR');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MatriculaFormValues>({
    resolver: zodResolver(matriculaEsquema),
  });

  const selectedOfertaId = watch('idOfertaGradoSede');
  const { data: secciones = [] } = usarDetalleSecciones(selectedOfertaId); // Secciones de la oferta seleccionada

  const onSubmit = async (valores: MatriculaFormValues) => {
    try {
      await registrar(valores);
      toast.success('Matrícula registrada en borrador');
      reset();
      setMostrarModal(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al registrar matrícula');
    }
  };

  const handleActivar = async (id: string) => {
    try {
      await activar(id);
      toast.success('Matrícula activada con éxito');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al activar matrícula');
    }
  };

  const handleAnular = async (id: string) => {
    const motivo = prompt('Ingrese el motivo de la anulación:');
    if (!motivo) return;
    try {
      await anular({ id, motivo });
      toast.success('Matrícula anulada');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al anular matrícula');
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
          <h1 className="text-3xl font-bold tracking-tight">Matrículas de Estudiantes</h1>
          <p className="text-muted-foreground">Listado de fichas de matrícula y transiciones de estado operativo.</p>
        </div>
        {puedeGestionar && (
          <button
            onClick={() => setMostrarModal(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
          >
            Nueva Matrícula
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value);
            setPagina(1);
          }}
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        >
          <option value="">Todos los estados</option>
          <option value="BORRADOR">Borrador</option>
          <option value="ACTIVA">Activa</option>
          <option value="RETIRADO">Retirado</option>
          <option value="ANULADA">Anulada</option>
        </select>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Código</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Estudiante</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Fecha</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
                <th className="h-12 px-4 text-right align-middle font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {matriculas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center align-middle text-muted-foreground">
                    No se encontraron matrículas registradas.
                  </td>
                </tr>
              ) : (
                matriculas.map((mat) => (
                  <tr key={mat.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{mat.codigo}</td>
                    <td className="p-4 align-middle">
                      {mat.estudiante?.persona
                        ? `${mat.estudiante.persona.apellidoPaterno} ${mat.estudiante.persona.apellidoMaterno}, ${mat.estudiante.persona.nombres}`
                        : 'Cargando...'}
                    </td>
                    <td className="p-4 align-middle">{mat.fechaMatricula.slice(0, 10)}</td>
                    <td className="p-4 align-middle">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          mat.estado === 'ACTIVA'
                            ? 'bg-success/15 text-success'
                            : mat.estado === 'BORRADOR'
                            ? 'bg-warning/15 text-warning'
                            : 'bg-destructive/15 text-destructive'
                        }`}
                      >
                        {mat.estado}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right space-x-2">
                      {mat.estado === 'BORRADOR' && puedeActivar && (
                        <button
                          onClick={() => handleActivar(mat.id)}
                          className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted"
                        >
                          Activar
                        </button>
                      )}
                      {mat.estado !== 'ANULADA' && puedeAnular && (
                        <button
                          onClick={() => handleAnular(mat.id)}
                          className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted text-destructive"
                        >
                          Anular
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

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-bold">Registrar Matrícula</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Estudiante Activo</label>
                <select
                  {...register('idEstudiante')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="">Seleccione estudiante...</option>
                  {estudiantes.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.persona.apellidoPaterno} {e.persona.apellidoMaterno}, {e.persona.nombres} ({e.codigo})
                    </option>
                  ))}
                </select>
                {errors.idEstudiante && (
                  <span className="text-xs text-destructive">{errors.idEstudiante.message}</span>
                )}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Año Académico</label>
                <select
                  value={idAnio}
                  onChange={(e) => setIdAnio(e.target.value)}
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

              <div className="grid gap-1">
                <label className="text-sm font-medium">Oferta Académica (Grado)</label>
                <select
                  disabled={!idAnio}
                  {...register('idOfertaGradoSede')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="">Seleccione grado académico...</option>
                  {ofertas.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.grado?.nombre || 'Grado'}
                    </option>
                  ))}
                </select>
                {errors.idOfertaGradoSede && (
                  <span className="text-xs text-destructive">{errors.idOfertaGradoSede.message}</span>
                )}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Sección Destino</label>
                <select
                  disabled={!selectedOfertaId}
                  {...register('idSeccionAcademica')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="">Seleccione sección...</option>
                  {secciones.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} (Capacidad: {s.capacidadMaxima} alumnos)
                    </option>
                  ))}
                </select>
                {errors.idSeccionAcademica && (
                  <span className="text-xs text-destructive">{errors.idSeccionAcademica.message}</span>
                )}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Fecha de Matrícula (AAAA-MM-DD)</label>
                <input
                  type="text"
                  placeholder="Ej. 2026-03-01"
                  {...register('fechaMatricula')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.fechaMatricula && (
                  <span className="text-xs text-destructive">{errors.fechaMatricula.message}</span>
                )}
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
                  {estaRegistrando ? 'Registrando...' : 'Registrar Matrícula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
