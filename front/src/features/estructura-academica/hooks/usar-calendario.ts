import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirBackendError } from '@/lib/errores/traducir-error';

export interface AnioAcademico {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

async function listarAnios(estado: string): Promise<AnioAcademico[]> {
  let url = '/api/panel/estructura-academica/calendario';
  if (estado) url += `?estado=${estado}`;

  const res = await fetch(url);
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al listar años académicos');
  }
  return res.json();
}

async function crearAnio(datos: { nombre: string; fechaInicio: string; fechaFin: string }): Promise<AnioAcademico> {
  const res = await fetch('/api/panel/estructura-academica/calendario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al crear año académico');
  }
  return res.json();
}

export function usarCalendario(estado = '') {
  const queryClient = useQueryClient();

  const query = useQuery<AnioAcademico[]>({
    queryKey: ['anios-academicos', estado],
    queryFn: () => listarAnios(estado),
  });

  const crearMutacion = useMutation<AnioAcademico, Error, { nombre: string; fechaInicio: string; fechaFin: string }>({
    mutationFn: crearAnio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anios-academicos'] });
    },
  });

  return {
    anios: query.data || [],
    estaCargando: query.isLoading,
    error: query.error,
    crear: crearMutacion.mutateAsync,
    estaCreando: crearMutacion.isPending,
  };
}
