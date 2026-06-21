'use client';

import Link from 'next/link';
import { MoreHorizontal, Eye, Pencil, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { BadgeEstadoPlan } from './badge-estado-plan';
import type { PlanEstudioItem } from '@/types/curriculo';

interface TablaPlanesProps {
  planes: PlanEstudioItem[];
  cargando: boolean;
  puedeGestionar: boolean;
  onDuplicar: (plan: PlanEstudioItem) => void;
}

function FilaSkeleton(): React.JSX.Element {
  return (
    <tr aria-hidden>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function TablaPlanes({
  planes,
  cargando,
  puedeGestionar,
  onDuplicar,
}: TablaPlanesProps): React.JSX.Element {
  return (
    <div className="overflow-x-auto rounded-lg border border-[--color-border]">
      <table className="w-full text-sm">
        <thead className="bg-[--color-surface-muted]">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text-primary]">
              Código
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text-primary]">
              Nombre
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text-primary]">
              Año
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text-primary]">
              Grado
            </th>
            <th scope="col" className="px-4 py-3 text-center font-semibold text-[--color-text-primary]">
              Ver.
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text-primary]">
              Estado
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-[--color-text-primary]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[--color-border]">
          {cargando ? (
            Array.from({ length: 5 }).map((_, i) => <FilaSkeleton key={i} />)
          ) : planes.length === 0 ? null : (
            planes.map((plan) => (
              <tr
                key={plan.id}
                className="bg-[--color-surface] transition-colors hover:bg-[--color-surface-muted]"
              >
                <td className="px-4 py-3 font-mono text-xs text-[--color-text-secondary]">
                  {plan.codigo}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/panel/curriculo/planes-estudio/${plan.id}`}
                    className="font-medium text-[--color-text-primary] hover:text-[--color-brand-600] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-500]"
                  >
                    {plan.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[--color-text-secondary]">{plan.anio}</td>
                <td className="px-4 py-3 text-[--color-text-secondary]">
                  <span className="block">{plan.nombreGrado}</span>
                  <span className="text-xs text-[--color-text-tertiary]">{plan.nombreNivel}</span>
                </td>
                <td className="px-4 py-3 text-center text-[--color-text-secondary]">
                  {plan.version}
                </td>
                <td className="px-4 py-3">
                  <BadgeEstadoPlan estado={plan.estado} />
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Acciones para ${plan.nombre}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/panel/curriculo/planes-estudio/${plan.id}`}>
                          <Eye className="h-4 w-4" />
                          Ver detalle
                        </Link>
                      </DropdownMenuItem>
                      {puedeGestionar && plan.estado === 'BORRADOR' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/panel/curriculo/planes-estudio/${plan.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {puedeGestionar && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDuplicar(plan)}>
                            <Copy className="h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Representación móvil: tarjetas */}
      {!cargando && planes.length > 0 && (
        <div className="divide-y divide-[--color-border] sm:hidden" aria-hidden>
          {/* La tabla usa overflow-x-auto en pantallas pequeñas;
              la representación de tarjetas como refuerzo queda como deuda técnica. */}
        </div>
      )}
    </div>
  );
}
