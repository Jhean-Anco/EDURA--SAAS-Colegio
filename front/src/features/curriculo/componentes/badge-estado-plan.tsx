import { cn } from '@/lib/utils';
import type { EstadoPlan, EstadoDetalle } from '@/types/curriculo';

const ESTILOS_PLAN: Record<EstadoPlan, string> = {
  BORRADOR:
    'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:ring-yellow-700',
  APROBADO:
    'bg-blue-50 text-blue-800 ring-1 ring-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-700',
  VIGENTE:
    'bg-green-50 text-green-800 ring-1 ring-green-300 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-700',
  CERRADO:
    'bg-gray-100 text-gray-600 ring-1 ring-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-600',
  ANULADO:
    'bg-red-50 text-red-700 ring-1 ring-red-300 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-700',
};

const ETIQUETAS_PLAN: Record<EstadoPlan, string> = {
  BORRADOR: 'Borrador',
  APROBADO: 'Aprobado',
  VIGENTE: 'Vigente',
  CERRADO: 'Cerrado',
  ANULADO: 'Anulado',
};

export function BadgeEstadoPlan({
  estado,
  className,
}: {
  estado: EstadoPlan;
  className?: string;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        ESTILOS_PLAN[estado],
        className,
      )}
    >
      {ETIQUETAS_PLAN[estado]}
    </span>
  );
}

const ESTILOS_DETALLE: Record<EstadoDetalle, string> = {
  ACTIVO:
    'bg-green-50 text-green-800 ring-1 ring-green-300 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-700',
  INACTIVO:
    'bg-gray-100 text-gray-600 ring-1 ring-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-600',
};

export function BadgeEstadoDetalle({
  estado,
}: {
  estado: EstadoDetalle;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        ESTILOS_DETALLE[estado],
      )}
    >
      {estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
    </span>
  );
}
