'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TablaPlanes } from '@/features/curriculo/componentes/tabla-planes';
import { FiltrosPlanes } from '@/features/curriculo/componentes/filtros-planes';
import { DialogoDuplicarPlan } from '@/features/curriculo/componentes/dialogo-duplicar-plan';
import { usarPlanes } from '@/features/curriculo/hooks/usar-planes';
import { usarAnios } from '@/features/curriculo/hooks/usar-anios';
import { usarGrados } from '@/features/curriculo/hooks/usar-grados';
import { traducirError } from '@/lib/errores/traducir-error';
import type { PlanEstudioItem, FiltrosPlanes as TFiltros, EstadoPlan } from '@/types/curriculo';
import type { Ambito } from '@/types/auth';

interface Ctx {
  institucionId: string;
  ambito: Ambito;
  sedeId: string | null;
}

interface ListadoPlanesClientProps {
  ctx: Ctx;
  permisos: string[];
}

export function ListadoPlanesClient({
  ctx,
  permisos,
}: ListadoPlanesClientProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const [planADuplicar, setPlanADuplicar] = useState<PlanEstudioItem | null>(null);

  const filtros: TFiltros = {
    idAnio: searchParams.get('idAnio') ?? undefined,
    idGrado: searchParams.get('idGrado') ?? undefined,
    estado: (searchParams.get('estado') as EstadoPlan) ?? undefined,
  };

  const { data: planes, isLoading, isError, error, refetch } = usarPlanes(ctx, filtros);
  const { data: anios = [] } = usarAnios(ctx, 'ACTIVO');
  const { data: grados = [] } = usarGrados(ctx);

  const puedeGestionar = permisos.includes('CURRICULO.PLANES.GESTIONAR');

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[--color-text-primary]">Planes de estudio</h1>
          <p className="text-sm text-[--color-text-secondary]">
            Gestiona los planes curriculares de la institución.
          </p>
        </div>
        {puedeGestionar && (
          <Button asChild>
            <Link href="/panel/curriculo/planes-estudio/nuevo">
              <Plus className="h-4 w-4" />
              Nuevo plan
            </Link>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <FiltrosPlanes anios={anios} grados={grados} />

      {/* Error */}
      {isError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
        >
          <span>{traducirError(error)}</span>
          <Button variant="ghost" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Tabla */}
      {!isError && (
        <TablaPlanes
          planes={planes ?? []}
          cargando={isLoading}
          puedeGestionar={puedeGestionar}
          onDuplicar={setPlanADuplicar}
        />
      )}

      {/* Estado vacío */}
      {!isLoading && !isError && planes?.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[--color-border] py-16 text-center">
          <p className="text-[--color-text-secondary]">No hay planes de estudio con los filtros seleccionados.</p>
          {puedeGestionar && (
            <Button asChild variant="outline">
              <Link href="/panel/curriculo/planes-estudio/nuevo">
                <Plus className="h-4 w-4" />
                Crear el primer plan
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Diálogo duplicar */}
      {planADuplicar && (
        <DialogoDuplicarPlan
          abierto={Boolean(planADuplicar)}
          onCerrar={() => setPlanADuplicar(null)}
          plan={planADuplicar}
          anios={anios}
          ctx={ctx}
        />
      )}
    </div>
  );
}
