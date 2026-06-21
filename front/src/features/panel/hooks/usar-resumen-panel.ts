'use client';

import { useQuery } from '@tanstack/react-query';
import { claves } from '@/lib/query/claves';
import { esBackendError } from '@/types/api';
import { traducirError } from '@/lib/errores/traducir-error';
import type { ContextoDescriptor } from '@/types/auth';

interface Alerta {
  tipo: string;
  mensaje: string;
  fecha: string;
}

export interface ResumenPanel {
  totalEstudiantes: number;
  totalDocentes: number;
  totalSecciones: number;
  alertas: Alerta[];
}

async function obtenerResumen(): Promise<ResumenPanel> {
  const res = await fetch('/api/panel/resumen');

  if (!res.ok) {
    const json: unknown = await res.json().catch(() => null);
    if (esBackendError(json)) throw traducirError(json, res.status);
    throw new Error('Error al cargar el panel');
  }

  return res.json() as Promise<ResumenPanel>;
}

export function usarResumenPanel(contexto: Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>) {
  return useQuery({
    queryKey: claves.panel.resumen(contexto),
    queryFn: obtenerResumen,
  });
}
