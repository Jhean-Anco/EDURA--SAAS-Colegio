import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirBackendError } from '@/lib/errores/traducir-error';

export interface Institucion {
  id: string;
  codigo: string;
  nombreLegal: string;
  nombreCorto?: string;
  tipoGestion?: string;
  estado: string;
}

async function obtenerInstitucion(): Promise<Institucion> {
  const res = await fetch('/api/panel/institucion');
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al obtener los datos de la institución');
  }
  return res.json();
}

async function actualizarInstitucion(datos: Partial<Institucion>): Promise<void> {
  const res = await fetch('/api/panel/institucion', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al actualizar los datos de la institución');
  }
}

export function usarInstitucion(institucionId?: string) {
  const queryClient = useQueryClient();

  const infoQuery = useQuery<Institucion>({
    queryKey: ['institucion', institucionId],
    queryFn: obtenerInstitucion,
    enabled: !!institucionId,
  });

  const actualizarMutacion = useMutation<void, Error, Partial<Institucion>>({
    mutationFn: actualizarInstitucion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institucion'] });
    },
  });

  return {
    institucion: infoQuery.data,
    estaCargando: infoQuery.isLoading,
    error: infoQuery.error,
    actualizar: actualizarMutacion.mutateAsync,
    estaActualizando: actualizarMutacion.isPending,
  };
}
