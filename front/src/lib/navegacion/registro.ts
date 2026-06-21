import { LayoutDashboard } from 'lucide-react';
import type { NavItem } from '@/types/navegacion';
import type { ContextoDescriptor } from '@/types/auth';

export const REGISTRO_NAVEGACION: NavItem[] = [
  {
    codigo: 'panel',
    etiqueta: 'Panel',
    ruta: '/panel',
    icono: LayoutDashboard,
    permisos: ['PANEL_INSTITUCIONAL.RESUMEN.LEER'],
    ambitos: ['INSTITUCION', 'SEDE'],
  },
];

export function resolverNavegacion(contexto: ContextoDescriptor): NavItem[] {
  return REGISTRO_NAVEGACION.filter(
    (item) =>
      item.ambitos.includes(contexto.ambito) &&
      item.permisos.every((p) => contexto.permisos.includes(p)),
  );
}
