'use client';

import type { LucideIcon } from 'lucide-react';
import { TarjetaIndicador } from '@/features/panel/componentes/tarjeta-indicador';
import { ListaAlertas } from '@/features/panel/componentes/lista-alertas';
import { ErrorDisplay } from '@/components/feedback/error-display';
import { SkeletonPanel } from '@/components/feedback/skeleton-panel';
import { usarResumenPanel } from '@/features/panel/hooks/usar-resumen-panel';
import type { ContextoDescriptor } from '@/types/auth';
import type { ErrorApi } from '@/lib/errores/traducir-error';

interface PanelClientWrapperProps {
  contexto: Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;
  iconos: {
    estudiantes: LucideIcon;
    docentes: LucideIcon;
    secciones: LucideIcon;
  };
}

export function PanelClientWrapper({ contexto, iconos }: PanelClientWrapperProps): React.JSX.Element {
  const { data, isLoading, error } = usarResumenPanel(contexto);

  if (isLoading) return <SkeletonPanel />;
  if (error) return <ErrorDisplay error={error as ErrorApi | Error} />;
  if (!data) return <SkeletonPanel />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TarjetaIndicador
          etiqueta="Estudiantes"
          valor={data.totalEstudiantes}
          icono={iconos.estudiantes}
          descripcion="Matriculados este año"
        />
        <TarjetaIndicador
          etiqueta="Docentes"
          valor={data.totalDocentes}
          icono={iconos.docentes}
          descripcion="Activos en la institución"
        />
        <TarjetaIndicador
          etiqueta="Secciones"
          valor={data.totalSecciones}
          icono={iconos.secciones}
          descripcion="Secciones académicas abiertas"
        />
      </div>

      <ListaAlertas alertas={data.alertas} />
    </div>
  );
}
