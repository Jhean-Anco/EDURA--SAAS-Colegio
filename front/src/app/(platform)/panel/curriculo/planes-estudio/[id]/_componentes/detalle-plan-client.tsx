'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronLeft, Pencil, Copy, CheckCircle, RefreshCw,
  Plus, MoreHorizontal, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BadgeEstadoPlan, BadgeEstadoDetalle } from '@/features/curriculo/componentes/badge-estado-plan';
import { DialogoAprobarPlan } from '@/features/curriculo/componentes/dialogo-aprobar-plan';
import { DialogoCambiarEstadoPlan } from '@/features/curriculo/componentes/dialogo-cambiar-estado-plan';
import { DialogoDuplicarPlan } from '@/features/curriculo/componentes/dialogo-duplicar-plan';
import { FormularioDetalle } from '@/features/curriculo/componentes/formulario-detalle';
import { usarPlan } from '@/features/curriculo/hooks/usar-plan';
import { usarAnios } from '@/features/curriculo/hooks/usar-anios';
import { usarAsignaturas } from '@/features/curriculo/hooks/usar-asignaturas';
import {
  usarAgregarDetalle,
  usarActualizarDetalle,
  usarCambiarEstadoDetalle,
} from '@/features/curriculo/hooks/usar-mutaciones-plan';
import { traducirError } from '@/lib/errores/traducir-error';
import { transicionesValidas, puedeAprobarPlan, puedeEditarPlan } from '@/types/curriculo';
import type { DetallePlan, EstadoPlan, PlanEstudio } from '@/types/curriculo';
import type { Ambito } from '@/types/auth';
import type { AgregarDetalleFormValues } from '@/features/curriculo/esquemas/detalle.schema';

type Ctx = { institucionId: string; ambito: Ambito; sedeId: string | null };

interface DetallePlanClientProps {
  id: string;
  ctx: Ctx;
  permisos: string[];
}

const ETIQUETAS_ESTADO: Record<EstadoPlan, string> = {
  BORRADOR: 'Borrador', APROBADO: 'Aprobado', VIGENTE: 'Vigente',
  CERRADO: 'Cerrado', ANULADO: 'Anulado',
};

export function DetallePlanClient({ id, ctx, permisos }: DetallePlanClientProps): React.JSX.Element {
  const router = useRouter();
  const { data: plan, isLoading, isError, error, refetch } = usarPlan(ctx, id);
  const { data: anios = [] } = usarAnios(ctx);
  const { data: asignaturas = [] } = usarAsignaturas(ctx);

  const [modalAprobar, setModalAprobar] = useState(false);
  const [estadoDestino, setEstadoDestino] = useState<EstadoPlan | null>(null);
  const [modalDuplicar, setModalDuplicar] = useState(false);
  const [detalleEditar, setDetalleEditar] = useState<DetallePlan | null>(null);
  const [modalAgregarDetalle, setModalAgregarDetalle] = useState(false);

  const puedeGestionar = permisos.includes('CURRICULO.PLANES.GESTIONAR');
  const puedeAprobar = permisos.includes('CURRICULO.PLANES.APROBAR');
  const puedeCambiarEstado = permisos.includes('CURRICULO.PLANES.CAMBIAR_ESTADO');

  const { mutateAsync: agregarDetalle, isPending: agregando } = usarAgregarDetalle(ctx, id);
  const { mutateAsync: actualizarDetalle, isPending: actualizando } = usarActualizarDetalle(
    ctx, id, detalleEditar?.id ?? '',
  );
  const { mutateAsync: cambiarEstadoDetalle } = usarCambiarEstadoDetalle(ctx, id, '');

  const asignaturasEnUso = plan?.detalles.map((d) => d.idAsignatura) ?? [];

  const onSubmitDetalle = async (data: AgregarDetalleFormValues) => {
    try {
      if (detalleEditar) {
        await actualizarDetalle(data);
        toast.success('Asignatura actualizada');
      } else {
        await agregarDetalle(data);
        toast.success('Asignatura agregada al plan');
      }
      setModalAgregarDetalle(false);
      setDetalleEditar(null);
    } catch (err) {
      toast.error(traducirError(err));
    }
  };

  if (isLoading) return <DetalleSkeleton />;

  if (isError || !plan) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-[--color-text-secondary]">{traducirError(error)}</p>
        <Button variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" /> Reintentar
        </Button>
        <Button variant="ghost" onClick={() => router.push('/panel/curriculo/planes-estudio')}>
          <ChevronLeft className="h-4 w-4" /> Volver al listado
        </Button>
      </div>
    );
  }

  const transiciones = transicionesValidas(plan.estado);

  return (
    <div className="space-y-6">
      {/* Breadcrumb nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/panel/curriculo/planes-estudio">
          <ChevronLeft className="h-4 w-4" /> Planes de estudio
        </Link>
      </Button>

      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[--color-text-primary]">{plan.nombre}</h1>
            <BadgeEstadoPlan estado={plan.estado} />
          </div>
          <p className="text-sm text-[--color-text-secondary] font-mono">{plan.codigo}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {puedeGestionar && puedeEditarPlan(plan.estado) && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/panel/curriculo/planes-estudio/${plan.id}/editar`}>
                <Pencil className="h-4 w-4" /> Editar
              </Link>
            </Button>
          )}
          {puedeAprobar && puedeAprobarPlan(plan.estado) && (
            <Button size="sm" onClick={() => setModalAprobar(true)}>
              <CheckCircle className="h-4 w-4" /> Aprobar
            </Button>
          )}
          {puedeCambiarEstado && transiciones.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Cambiar estado <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {transiciones.map((t) => (
                  <DropdownMenuItem key={t} onClick={() => setEstadoDestino(t)}>
                    {ETIQUETAS_ESTADO[t]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {puedeGestionar && (
            <Button variant="ghost" size="sm" onClick={() => setModalDuplicar(true)}>
              <Copy className="h-4 w-4" /> Duplicar
            </Button>
          )}
        </div>
      </div>

      {/* Metadatos */}
      <div className="grid gap-4 rounded-lg border border-[--color-border] bg-[--color-surface] p-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetaDato label="Año académico" valor={String(plan.anio)} />
        <MetaDato label="Grado" valor={`${plan.nombreGrado} — ${plan.nombreNivel}`} />
        <MetaDato label="Versión" valor={String(plan.version)} />
        <MetaDato label="Total horas sem." valor={`${plan.totalHorasSemanales} h`} />
        <MetaDato label="Total horas anuales" valor={`${plan.totalHorasAnuales} h`} />
        <MetaDato label="Asignaturas activas" valor={String(plan.totalAsignaturasActivas)} />
        {plan.fechaAprobacion && (
          <MetaDato
            label="Fecha aprobación"
            valor={new Date(plan.fechaAprobacion).toLocaleDateString('es-PE')}
          />
        )}
        {plan.observacion && (
          <div className="sm:col-span-2 lg:col-span-4">
            <MetaDato label="Observaciones" valor={plan.observacion} />
          </div>
        )}
      </div>

      {/* Detalles / asignaturas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[--color-text-primary]">Asignaturas</h2>
          {puedeGestionar && puedeEditarPlan(plan.estado) && (
            <Button size="sm" onClick={() => setModalAgregarDetalle(true)}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          )}
        </div>

        {plan.detalles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[--color-border] py-10 text-center">
            <p className="text-sm text-[--color-text-secondary]">
              Este plan aún no tiene asignaturas.
            </p>
            {puedeGestionar && puedeEditarPlan(plan.estado) && (
              <Button variant="outline" size="sm" onClick={() => setModalAgregarDetalle(true)}>
                <Plus className="h-4 w-4" /> Agregar primera asignatura
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[--color-border]">
            <table className="w-full text-sm">
              <thead className="bg-[--color-surface-muted]">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Ord.</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Asignatura</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Área</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Tipo</th>
                  <th scope="col" className="px-4 py-3 text-center font-semibold">H.Sem</th>
                  <th scope="col" className="px-4 py-3 text-center font-semibold">H.Anu</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Estado</th>
                  {puedeGestionar && puedeEditarPlan(plan.estado) && (
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[--color-border]">
                {plan.detalles
                  .slice()
                  .sort((a, b) => a.orden - b.orden)
                  .map((d) => (
                    <FilaDetalle
                      key={d.id}
                      detalle={d}
                      puedeGestionar={puedeGestionar && puedeEditarPlan(plan.estado)}
                      onEditar={() => {
                        setDetalleEditar(d);
                        setModalAgregarDetalle(true);
                      }}
                      onCambiarEstado={async (estado) => {
                        try {
                          await cambiarEstadoDetalle({ estado });
                          toast.success(`Asignatura ${estado === 'ACTIVO' ? 'activada' : 'desactivada'}`);
                        } catch (err) {
                          toast.error(traducirError(err));
                        }
                      }}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      {modalAprobar && (
        <DialogoAprobarPlan
          abierto={modalAprobar}
          onCerrar={() => setModalAprobar(false)}
          plan={plan as PlanEstudio}
          ctx={ctx}
        />
      )}
      {estadoDestino && (
        <DialogoCambiarEstadoPlan
          abierto={Boolean(estadoDestino)}
          onCerrar={() => setEstadoDestino(null)}
          plan={plan as PlanEstudio}
          estadoDestino={estadoDestino}
          ctx={ctx}
        />
      )}
      {modalDuplicar && (
        <DialogoDuplicarPlan
          abierto={modalDuplicar}
          onCerrar={() => setModalDuplicar(false)}
          plan={plan}
          anios={anios}
          ctx={ctx}
        />
      )}
      <FormularioDetalle
        abierto={modalAgregarDetalle}
        onCerrar={() => { setModalAgregarDetalle(false); setDetalleEditar(null); }}
        asignaturas={asignaturas}
        detalleInicial={detalleEditar ?? undefined}
        isPending={agregando || actualizando}
        asignaturasEnUso={asignaturasEnUso}
        onSubmit={onSubmitDetalle}
      />
    </div>
  );
}

function MetaDato({ label, valor }: { label: string; valor: string }): React.JSX.Element {
  return (
    <div>
      <p className="text-xs font-medium text-[--color-text-tertiary] uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm text-[--color-text-primary]">{valor}</p>
    </div>
  );
}

interface FilaDetalleProps {
  detalle: DetallePlan;
  puedeGestionar: boolean;
  onEditar: () => void;
  onCambiarEstado: (estado: 'ACTIVO' | 'INACTIVO') => Promise<void>;
}

function FilaDetalle({ detalle, puedeGestionar, onEditar, onCambiarEstado }: FilaDetalleProps): React.JSX.Element {
  return (
    <tr className="bg-[--color-surface] hover:bg-[--color-surface-muted]">
      <td className="px-4 py-3 text-center text-[--color-text-secondary]">{detalle.orden}</td>
      <td className="px-4 py-3 font-medium text-[--color-text-primary]">
        {detalle.nombreAsignatura}
        {detalle.codigoAsignatura && (
          <span className="ml-1 font-mono text-xs text-[--color-text-tertiary]">
            ({detalle.codigoAsignatura})
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-[--color-text-secondary]">{detalle.nombreAreaCurricular}</td>
      <td className="px-4 py-3 text-[--color-text-secondary]">
        {detalle.tipo === 'OBLIGATORIA' ? 'Obligatoria' : 'Electiva'}
      </td>
      <td className="px-4 py-3 text-center text-[--color-text-secondary]">{detalle.horasSemanales}</td>
      <td className="px-4 py-3 text-center text-[--color-text-secondary]">{detalle.horasAnuales}</td>
      <td className="px-4 py-3">
        <BadgeEstadoDetalle estado={detalle.estado} />
      </td>
      {puedeGestionar && (
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Editar ${detalle.nombreAsignatura}`}
              onClick={onEditar}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                detalle.estado === 'ACTIVO'
                  ? `Desactivar ${detalle.nombreAsignatura}`
                  : `Activar ${detalle.nombreAsignatura}`
              }
              onClick={() =>
                void onCambiarEstado(detalle.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO')
              }
            >
              {detalle.estado === 'ACTIVO' ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-[--color-text-muted]" />
              )}
            </Button>
          </div>
        </td>
      )}
    </tr>
  );
}

function DetalleSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}
