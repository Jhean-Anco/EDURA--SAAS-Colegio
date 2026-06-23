import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirBackendError } from '@/lib/errores/traducir-error';

export interface Sede {
  id: string;
  institucionId: string;
  codigo: string;
  nombre: string;
  esPrincipal: boolean;
  estado: string;
}

async function listarSedes(): Promise<Sede[]> {
  const res = await fetch('/api/panel/sedes');
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al obtener el listado de sedes');
  }
  const data = await res.json();
  return data.datos || [];
}

async function crearSede(datos: { codigo: string; nombre: string }): Promise<Sede> {
  const res = await fetch('/api/panel/sedes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al crear la sede');
  }
  return res.json();
}

async function establecerPrincipal(idSede: string): Promise<void> {
  const res = await fetch(`/api/panel/sedes/${idSede}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al establecer sede principal');
  }
}

async function cambiarEstadoSede({ idSede, estado }: { idSede: string; estado: 'ACTIVA' | 'INACTIVA' | 'BAJA' }): Promise<void> {
  const res = await fetch(`/api/panel/sedes/${idSede}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al cambiar el estado de la sede');
  }
}

export function usarSedes(institucionId?: string) {
  const queryClient = useQueryClient();

  const sedesQuery = useQuery<Sede[]>({
    queryKey: ['sedes', institucionId],
    queryFn: listarSedes,
    enabled: !!institucionId,
  });

  const crearMutacion = useMutation<Sede, Error, { codigo: string; nombre: string }>({
    mutationFn: crearSede,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
    },
  });

  const principalMutacion = useMutation<void, Error, string>({
    mutationFn: establecerPrincipal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
    },
  });

  const estadoMutacion = useMutation<void, Error, { idSede: string; estado: 'ACTIVA' | 'INACTIVA' | 'BAJA' }>({
    mutationFn: cambiarEstadoSede,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
    },
  });

  return {
    sedes: sedesQuery.data || [],
    estaCargando: sedesQuery.isLoading,
    error: sedesQuery.error,
    crear: crearMutacion.mutateAsync,
    estaCreando: crearMutacion.isPending,
    establecerPrincipal: principalMutacion.mutateAsync,
    estaEstableciendoPrincipal: principalMutacion.isPending,
    cambiarEstado: estadoMutacion.mutateAsync,
    estaCambiandoEstado: estadoMutacion.isPending,
  };
}
