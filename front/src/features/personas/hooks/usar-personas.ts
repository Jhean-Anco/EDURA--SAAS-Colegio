import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirBackendError } from '@/lib/errores/traducir-error';

export interface Persona {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento?: string;
  sexoRegistral?: string;
  estado: string;
  numeroDocumento?: string;
}

interface ListarPersonasRespuesta {
  datos: Persona[];
  total: number;
}

async function listarPersonas(busqueda: string, pagina: number): Promise<ListarPersonasRespuesta> {
  const res = await fetch(`/api/panel/personas?busqueda=${encodeURIComponent(busqueda)}&pagina=${pagina}&limite=20`);
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al listar personas');
  }
  return res.json();
}

async function registrarPersona(datos: {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  sexoRegistral: string;
}): Promise<Persona> {
  const res = await fetch('/api/panel/personas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al registrar persona');
  }
  return res.json();
}

async function consultarDni(numeroDni: string): Promise<{ nombres: string; apellidoPaterno: string; apellidoMaterno: string }> {
  const res = await fetch('/api/panel/integraciones?tipo=dni', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numeroDni }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al consultar DNI');
  }
  return res.json();
}

export function usarPersonas(busqueda = '', pagina = 1) {
  const queryClient = useQueryClient();

  const query = useQuery<ListarPersonasRespuesta>({
    queryKey: ['personas', busqueda, pagina],
    queryFn: () => listarPersonas(busqueda, pagina),
  });

  const registrarMutacion = useMutation<
    Persona,
    Error,
    { nombres: string; apellidoPaterno: string; apellidoMaterno: string; fechaNacimiento: string; sexoRegistral: string }
  >({
    mutationFn: registrarPersona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
  });

  const dniMutacion = useMutation<{ nombres: string; apellidoPaterno: string; apellidoMaterno: string }, Error, string>({
    mutationFn: consultarDni,
  });

  return {
    personas: query.data?.datos || [],
    total: query.data?.total || 0,
    estaCargando: query.isLoading,
    error: query.error,
    registrar: registrarMutacion.mutateAsync,
    estaRegistrando: registrarMutacion.isPending,
    consultarDni: dniMutacion.mutateAsync,
    estaConsultandoDni: dniMutacion.isPending,
  };
}
