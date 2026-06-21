import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TarjetaIndicadorProps {
  etiqueta: string;
  valor: number | string;
  icono: LucideIcon;
  descripcion?: string;
  className?: string;
}

export function TarjetaIndicador({
  etiqueta,
  valor,
  icono: Icono,
  descripcion,
  className,
}: TarjetaIndicadorProps): React.JSX.Element {
  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[--color-text-secondary]">{etiqueta}</p>
            <p className="text-3xl font-bold text-[--color-text-primary]">{valor}</p>
            {descripcion && (
              <p className="text-xs text-[--color-text-muted]">{descripcion}</p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--color-brand-50] dark:bg-[--color-brand-900]/20">
            <Icono className="h-5 w-5 text-[--color-brand-600]" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
