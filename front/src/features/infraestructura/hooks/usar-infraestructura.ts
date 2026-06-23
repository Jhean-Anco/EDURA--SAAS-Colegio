import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirBackendError } from '@/lib/errores/traducir-error';

export interface ElementoInfraestructura {
  id: string;
  sedeId: string;
  tipoElementoId: string;
  codigo: string;
  nombre: string;
  estado: string;
  orden?: number;
}

export interface ServicioBasico {
  id: string;
  sedeId: string;
  tipoServicioCodigo: string;
  proveedor?: string;
  numeroSuministro?: string;
  estadoServicio: string;
}

interface DatosInfraestructura {
  elementos: ElementoInfraestructura[];
  servicios: ServicioBasico[];
}

async function obtenerInfraestructura(): Promise<DatosInfraestructura> {
  const res = await fetch('/api/panel/infraestructura');
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al obtener la infraestructura de la sede');
  }
  return res.json();
}

async function registrarServicio(datos: {
  tipoServicioCodigo: string;
  proveedor?: string;
  numeroSuministro?: string;
}): Promise<ServicioBasico> {
  const res = await fetch('/api/panel/infraestructura', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al registrar el servicio básico');
  }
  return res.json();
}

export function usarInfraestructura(sedeId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<DatosInfraestructura>({
    queryKey: ['infraestructura', sedeId],
    queryFn: obtenerInfraestructura,
    enabled: !!sedeId,
  });

  const registrarServicioMutacion = useMutation<
    ServicioBasico,
    Error,
    { tipoServicioCodigo: string; proveedor?: string; numeroSuministro?: string }
  >({
    mutationFn: registrarServicio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infraestructura'] });
    },
  });

  return {
    elementos: query.data?.elementos || [],
    servicios: query.data?.servicios || [],
    estaCargando: query.isLoading,
    error: query.error,
    registrarServicio: registrarServicioMutacion.mutateAsync,
    estaRegistrandoServicio: registrarServicioMutacion.isPending,
  };
}
