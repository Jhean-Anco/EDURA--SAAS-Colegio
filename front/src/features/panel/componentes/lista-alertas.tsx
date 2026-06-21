import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/feedback/empty-state';

interface Alerta {
  tipo: string;
  mensaje: string;
  fecha: string;
}

interface ListaAlertasProps {
  alertas: Alerta[];
}

const VARIANTES_TIPO: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  CRITICA: 'destructive',
  ADVERTENCIA: 'warning',
  INFO: 'secondary',
};

export function ListaAlertas({ alertas }: ListaAlertasProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" aria-hidden />
          Alertas institucionales
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alertas.length === 0 ? (
          <EmptyState
            titulo="Sin alertas"
            descripcion="No hay alertas activas en este momento."
          />
        ) : (
          <ul className="space-y-3">
            {alertas.map((alerta, i) => (
              <li key={i} className="flex items-start gap-3">
                <Badge
                  variant={VARIANTES_TIPO[alerta.tipo] ?? 'secondary'}
                  className="mt-0.5 shrink-0"
                >
                  {alerta.tipo}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[--color-text-primary]">{alerta.mensaje}</p>
                  <p className="text-xs text-[--color-text-muted]">
                    {new Date(alerta.fecha).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
