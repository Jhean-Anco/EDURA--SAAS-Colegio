import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirBackendError } from '@/lib/errores/traducir-error';

export interface Docente {
  id: string;
  codigo: string;
  fechaIngreso?: string;
  perfilProfesional?: string;
  estado: string;
  persona: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

interface ListarDocentesRespuesta {
  datos: Docente[];
  total: number;
}

async function listarDocentes(busqueda: string, estado: string, pagina: number): Promise<ListarDocentesRespuesta> {
  let url = `/api/panel/docentes?pagina=${pagina}&limite=20`;
  if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`;
  if (estado) url += `&estado=${estado}`;

  const res = await fetch(url);
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al listar docentes');
  }
  return res.json();
}

async function registrarDocente(datos: {
  idPersona: string;
  codigo: string;
  fechaIngreso?: string;
  perfilProfesional?: string;
  observacion?: string;
}): Promise<Docente> {
  const res = await fetch('/api/panel/docentes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al registrar docente');
  }
  return res.json();
}

async function cambiarEstadoDocente({ id, estado, fechaCese }: { id: string; estado: string; fechaCese?: string }): Promise<void> {
  const res = await fetch(`/api/panel/docentes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, fechaCese }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al cambiar el estado del docente');
  }
}

export function usarDocentes(busqueda = '', estado = '', pagina = 1) {
  const queryClient = useQueryClient();

  const query = useQuery<ListarDocentesRespuesta>({
    queryKey: ['docentes', busqueda, estado, pagina],
    queryFn: () => listarDocentes(busqueda, estado, pagina),
  });

  const registrarMutacion = useMutation<
    Docente,
    Error,
    { idPersona: string; codigo: string; fechaIngreso?: string; perfilProfesional?: string; observacion?: string }
  >({
    mutationFn: registrarDocente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docentes'] });
    },
  });

  const estadoMutacion = useMutation<void, Error, { id: string; estado: string; fechaCese?: string }>({
    mutationFn: cambiarEstadoDocente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docentes'] });
    },
  });

  return {
    docentes: query.data?.datos || [],
    total: query.data?.total || 0,
    estaCargando: query.isLoading,
    error: query.error,
    registrar: registrarMutacion.mutateAsync,
    estaRegistrando: registrarMutacion.isPending,
    cambiarEstado: estadoMutacion.mutateAsync,
    estaCambiandoEstado: estadoMutacion.isPending,
  };
}
