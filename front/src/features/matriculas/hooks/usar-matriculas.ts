import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { esBackendError } from '@/types/api';
import { traducirBackendError } from '@/lib/errores/traducir-error';

export interface Matricula {
  id: string;
  codigo: string;
  fechaMatricula: string;
  estado: string;
  idEstudiante: string;
  idSeccionAcademica: string;
  idOfertaGradoSede: string;
  estudiante?: {
    codigo: string;
    persona: {
      nombres: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };
  };
}

interface ListarMatriculasRespuesta {
  datos: Matricula[];
  total: number;
}

async function listarMatriculas(estado: string, pagina: number): Promise<ListarMatriculasRespuesta> {
  let url = `/api/panel/matriculas?pagina=${pagina}&limite=20`;
  if (estado) url += `&estado=${estado}`;

  const res = await fetch(url);
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al listar matrículas');
  }
  return res.json();
}

async function registrarMatricula(datos: {
  idEstudiante: string;
  idSeccionAcademica: string;
  idOfertaGradoSede: string;
  fechaMatricula: string;
}): Promise<Matricula> {
  const res = await fetch('/api/panel/matriculas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al registrar matrícula');
  }
  return res.json();
}

async function activarMatricula(id: string): Promise<void> {
  const res = await fetch(`/api/panel/matriculas/${id}?accion=activar`, {
    method: 'POST',
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al activar matrícula');
  }
}

async function anularMatricula({ id, motivo }: { id: string; motivo: string }): Promise<void> {
  const res = await fetch(`/api/panel/matriculas/${id}?accion=anular`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirBackendError(json, res.status);
    throw new Error('Error al anular matrícula');
  }
}

export function usarMatriculas(estado = '', pagina = 1) {
  const queryClient = useQueryClient();

  const query = useQuery<ListarMatriculasRespuesta>({
    queryKey: ['matriculas', estado, pagina],
    queryFn: () => listarMatriculas(estado, pagina),
  });

  const registrarMutacion = useMutation<
    Matricula,
    Error,
    { idEstudiante: string; idSeccionAcademica: string; idOfertaGradoSede: string; fechaMatricula: string }
  >({
    mutationFn: registrarMatricula,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
    },
  });

  const activarMutacion = useMutation<void, Error, string>({
    mutationFn: activarMatricula,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
    },
  });

  const anularMutacion = useMutation<void, Error, { id: string; motivo: string }>({
    mutationFn: anularMatricula,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
    },
  });

  return {
    matriculas: query.data?.datos || [],
    total: query.data?.total || 0,
    estaCargando: query.isLoading,
    error: query.error,
    registrar: registrarMutacion.mutateAsync,
    estaRegistrando: registrarMutacion.isPending,
    activar: activarMutacion.mutateAsync,
    estaActivando: activarMutacion.isPending,
    anular: anularMutacion.mutateAsync,
    estaAnulando: anularMutacion.isPending,
  };
}
