'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usarPersonas } from '@/features/personas/hooks/usar-personas';
import { toast } from 'sonner';

const personaEsquema = z.object({
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidoPaterno: z.string().min(2, 'El apellido paterno debe tener al menos 2 caracteres'),
  apellidoMaterno: z.string().min(2, 'El apellido materno debe tener al menos 2 caracteres'),
  fechaNacimiento: z.string().min(10, 'Debe ingresar la fecha de nacimiento (AAAA-MM-DD)'),
  sexoRegistral: z.enum(['MASCULINO', 'FEMENINO', 'NO_ESPECIFICADO']),
});

type PersonaFormValues = z.infer<typeof personaEsquema>;

interface ListadoPersonasClientProps {
  ctx: { institucionId: string; ambito: string; sedeId: string | null };
  permisos: string[];
}

export function ListadoPersonasClient({ ctx: _, permisos }: ListadoPersonasClientProps) {
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [dniConsulta, setDniConsulta] = useState('');

  const {
    personas,
    estaCargando,
    registrar,
    estaRegistrando,
    consultarDni,
    estaConsultandoDni,
  } = usarPersonas(busqueda, pagina);

  const puedeCrear = permisos.includes('PERSONAS.CREAR');
  const puedeConsultarDni = permisos.includes('PERSONAS.CONSULTAR_DNI');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PersonaFormValues>({
    resolver: zodResolver(personaEsquema),
    defaultValues: {
      sexoRegistral: 'NO_ESPECIFICADO',
    },
  });

  const handleBuscarDni = async () => {
    if (dniConsulta.length !== 8) {
      toast.error('El DNI debe tener 8 dígitos');
      return;
    }
    try {
      const data = await consultarDni(dniConsulta);
      setValue('nombres', data.nombres);
      setValue('apellidoPaterno', data.apellidoPaterno);
      setValue('apellidoMaterno', data.apellidoMaterno);
      toast.success('DNI consultado con éxito');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al consultar DNI');
    }
  };

  const onSubmit = async (valores: PersonaFormValues) => {
    try {
      await registrar(valores);
      toast.success('Persona registrada correctamente');
      reset();
      setDniConsulta('');
      setMostrarModal(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error al registrar persona');
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
          <h1 className="text-3xl font-bold tracking-tight">Padrón de Personas</h1>
          <p className="text-muted-foreground">Registro centralizado de miembros y personas vinculadas.</p>
        </div>
        {puedeCrear && (
          <button
            onClick={() => setMostrarModal(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95"
          >
            Registrar Persona
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
          className="max-w-xs rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        />
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Nombres</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Apellidos</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Fecha Nac.</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Sexo</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {personas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center align-middle text-muted-foreground">
                    No se encontraron personas registradas.
                  </td>
                </tr>
              ) : (
                personas.map((per) => (
                  <tr key={per.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{per.nombres}</td>
                    <td className="p-4 align-middle">
                      {per.apellidoPaterno} {per.apellidoMaterno}
                    </td>
                    <td className="p-4 align-middle">{per.fechaNacimiento || '—'}</td>
                    <td className="p-4 align-middle text-xs">{per.sexoRegistral || '—'}</td>
                    <td className="p-4 align-middle">
                      <span className="rounded bg-success/15 px-2 py-1 text-xs font-semibold text-success">
                        {per.estado}
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
            <h2 className="text-lg font-bold">Registrar Persona</h2>

            {puedeConsultarDni && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Consultar DNI (Reniec)..."
                  value={dniConsulta}
                  onChange={(e) => setDniConsulta(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleBuscarDni}
                  disabled={estaConsultandoDni}
                  className="rounded-md border bg-muted px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
                >
                  {estaConsultandoDni ? 'Buscando...' : 'Consultar'}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Nombres</label>
                <input
                  type="text"
                  {...register('nombres')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.nombres && <span className="text-xs text-destructive">{errors.nombres.message}</span>}
              </div>

              <div className="grid gap-2 grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Ape. Paterno</label>
                  <input
                    type="text"
                    {...register('apellidoPaterno')}
                    className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.apellidoPaterno && (
                    <span className="text-xs text-destructive">{errors.apellidoPaterno.message}</span>
                  )}
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Ape. Materno</label>
                  <input
                    type="text"
                    {...register('apellidoMaterno')}
                    className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.apellidoMaterno && (
                    <span className="text-xs text-destructive">{errors.apellidoMaterno.message}</span>
                  )}
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Fecha Nacimiento (AAAA-MM-DD)</label>
                <input
                  type="text"
                  placeholder="Ej. 1995-10-24"
                  {...register('fechaNacimiento')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.fechaNacimiento && (
                  <span className="text-xs text-destructive">{errors.fechaNacimiento.message}</span>
                )}
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Sexo Registral</label>
                <select
                  {...register('sexoRegistral')}
                  className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="NO_ESPECIFICADO">No especificado</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
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
