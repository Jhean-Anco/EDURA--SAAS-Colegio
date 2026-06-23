import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirBackendError } from '@/lib/errores/traducir-error';

export interface OfertaAcademica {
  id: string;
  idSede: string;
  idAnioAcademico: string;
  idGradoAcademico: string;
  estado: string;
  grado?: {
    nombre: string;
  };
}

export interface SeccionAcademica {
  id: string;
  idOfertaGradoSede: string;
  codigo: string;
  nombre: string;
  capacidadMaxima: number;
  estado: string;
}

async function listarOfertas(idAnio: string, estado: string): Promise<OfertaAcademica[]> {
  let url = '/api/panel/estructura-academica/secciones';
  const params: string[] = [];
  if (idAnio) params.push(`idAnio=${idAnio}`);
  if (estado) params.push(`estado=${estado}`);
  if (params.length > 0) url += `?${params.join('&')}`;

  const res = await fetch(url);
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al listar ofertas');
  }
  return res.json();
}

async function crearOferta(datos: { idAnioAcademico: string; idGradoAcademico: string }): Promise<OfertaAcademica> {
  const res = await fetch('/api/panel/estructura-academica/secciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al registrar oferta académica');
  }
  return res.json();
}

async function listarSecciones(idOferta: string): Promise<SeccionAcademica[]> {
  const res = await fetch(`/api/panel/estructura-academica/secciones/${idOferta}/secciones`);
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al listar secciones');
  }
  return res.json();
}

async function crearSeccion({
  idOferta,
  codigo,
  nombre,
  capacidadMaxima,
}: {
  idOferta: string;
  codigo: string;
  nombre: string;
  capacidadMaxima: number;
}): Promise<SeccionAcademica> {
  const res = await fetch(`/api/panel/estructura-academica/secciones/${idOferta}/secciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo, nombre, capacidadMaxima }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al registrar sección');
  }
  return res.json();
}

export function usarSecciones(idAnio = '', estado = '') {
  const queryClient = useQueryClient();

  const ofertasQuery = useQuery<OfertaAcademica[]>({
    queryKey: ['ofertas-academicas', idAnio, estado],
    queryFn: () => listarOfertas(idAnio, estado),
  });

  const crearOfertaMutacion = useMutation<OfertaAcademica, Error, { idAnioAcademico: string; idGradoAcademico: string }>({
    mutationFn: crearOferta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ofertas-academicas'] });
    },
  });

  const usarDetalleSecciones = (idOferta: string) => {
    return useQuery<SeccionAcademica[]>({
      queryKey: ['secciones-academicas', idOferta],
      queryFn: () => listarSecciones(idOferta),
      enabled: !!idOferta,
    });
  };

  const crearSeccionMutacion = useMutation<
    SeccionAcademica,
    Error,
    { idOferta: string; codigo: string; nombre: string; capacidadMaxima: number }
  >({
    mutationFn: crearSeccion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secciones-academicas', variables.idOferta] });
    },
  });

  return {
    ofertas: ofertasQuery.data || [],
    estaCargandoOfertas: ofertasQuery.isLoading,
    crearOferta: crearOfertaMutacion.mutateAsync,
    estaCreandoOferta: crearOfertaMutacion.isPending,
    usarDetalleSecciones,
    crearSeccion: crearSeccionMutacion.mutateAsync,
    estaCreandoSeccion: crearSeccionMutacion.isPending,
  };
}
