import { InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  titulo?: string;
  descripcion?: string;
  className?: string;
}

export function EmptyState({
  titulo = 'Sin datos',
  descripcion = 'No hay información disponible en este momento.',
  className,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <InboxIcon className="mb-4 h-10 w-10 text-[--color-text-muted]" aria-hidden />
      <h3 className="text-sm font-medium text-[--color-text-primary]">{titulo}</h3>
      <p className="mt-1 text-sm text-[--color-text-secondary]">{descripcion}</p>
    </div>
  );
}
