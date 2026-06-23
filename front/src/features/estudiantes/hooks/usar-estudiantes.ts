import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirBackendError } from '@/lib/errores/traducir-error';

export interface Estudiante {
  id: string;
  codigo: string;
  fechaIngreso?: string;
  estado: string;
  persona: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

interface ListarEstudiantesRespuesta {
  datos: Estudiante[];
  total: number;
}

async function listarEstudiantes(busqueda: string, estado: string, pagina: number): Promise<ListarEstudiantesRespuesta> {
  let url = `/api/panel/estudiantes?pagina=${pagina}&limite=20`;
  if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`;
  if (estado) url += `&estado=${estado}`;

  const res = await fetch(url);
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al listar estudiantes');
  }
  return res.json();
}

async function crearEstudiante(datos: {
  idPersona: string;
  codigo: string;
  fechaIngreso?: string;
  observacion?: string;
}): Promise<Estudiante> {
  const res = await fetch('/api/panel/estudiantes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al crear estudiante');
  }
  return res.json();
}

async function cambiarEstadoEstudiante({ id, estado }: { id: string; estado: string }): Promise<void> {
  const res = await fetch(`/api/panel/estudiantes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al cambiar el estado del estudiante');
  }
}

async function vincularApoderado({
  idEstudiante,
  idPersona,
  parentesco,
  esPrincipal,
}: {
  idEstudiante: string;
  idPersona: string;
  parentesco: string;
  esPrincipal: boolean;
}): Promise<void> {
  const res = await fetch(`/api/panel/estudiantes/${idEstudiante}/apoderados`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idPersona, parentesco, esPrincipal, puedeRecoger: true, recibeComunicaciones: true }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al vincular apoderado');
  }
}

export function usarEstudiantes(busqueda = '', estado = '', pagina = 1) {
  const queryClient = useQueryClient();

  const query = useQuery<ListarEstudiantesRespuesta>({
    queryKey: ['estudiantes', busqueda, estado, pagina],
    queryFn: () => listarEstudiantes(busqueda, estado, pagina),
  });

  const crearMutacion = useMutation<Estudiante, Error, { idPersona: string; codigo: string; fechaIngreso?: string; observacion?: string }>({
    mutationFn: crearEstudiante,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });

  const estadoMutacion = useMutation<void, Error, { id: string; estado: string }>({
    mutationFn: cambiarEstadoEstudiante,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });

  const apoderadoMutacion = useMutation<
    void,
    Error,
    { idEstudiante: string; idPersona: string; parentesco: string; esPrincipal: boolean }
  >({
    mutationFn: vincularApoderado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });

  return {
    estudiantes: query.data?.datos || [],
    total: query.data?.total || 0,
    estaCargando: query.isLoading,
    error: query.error,
    crear: crearMutacion.mutateAsync,
    estaCreando: crearMutacion.isPending,
    cambiarEstado: estadoMutacion.mutateAsync,
    estaCambiandoEstado: estadoMutacion.isPending,
    vincularApoderado: apoderadoMutacion.mutateAsync,
    estaVinculandoApoderado: apoderadoMutacion.isPending,
  };
}
