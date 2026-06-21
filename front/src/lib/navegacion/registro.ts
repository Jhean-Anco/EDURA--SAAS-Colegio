import { LayoutDashboard, BookOpen, GraduationCap } from 'lucide-react';
import type { NavGroup, NavItem } from '@/types/navegacion';
import type { ContextoDescriptor } from '@/types/auth';

export const GRUPOS_NAVEGACION: NavGroup[] = [
  {
    etiqueta: 'Inicio',
    items: [
      {
        codigo: 'panel',
        etiqueta: 'Panel',
        ruta: '/panel',
        icono: LayoutDashboard,
        permisos: ['PANEL_INSTITUCIONAL.RESUMEN.LEER'],
        ambitos: ['INSTITUCION', 'SEDE'],
      },
    ],
  },
  {
    etiqueta: 'Currículo',
    items: [
      {
        codigo: 'curriculo-planes',
        etiqueta: 'Planes de estudio',
        ruta: '/panel/curriculo/planes-estudio',
        icono: BookOpen,
        permisos: ['CURRICULO.LEER'],
        ambitos: ['INSTITUCION'],
      },
      {
        codigo: 'curriculo-areas',
        etiqueta: 'Áreas curriculares',
        ruta: '/panel/curriculo/areas',
        icono: GraduationCap,
        permisos: ['CURRICULO.LEER'],
        ambitos: ['INSTITUCION'],
      },
    ],
  },
];

// Compatibilidad con layout existente que usa NavItem[]
export const REGISTRO_NAVEGACION: NavItem[] = GRUPOS_NAVEGACION.flatMap(
  (g) => g.items,
);

export function resolverNavegacion(contexto: ContextoDescriptor): NavGroup[] {
  return GRUPOS_NAVEGACION.map((grupo) => ({
    ...grupo,
    items: grupo.items.filter(
      (item) =>
        item.ambitos.includes(contexto.ambito) &&
        item.permisos.every((p) => contexto.permisos.includes(p)),
    ),
  })).filter((grupo) => grupo.items.length > 0);
}

export function resolverNavegacionPlana(contexto: ContextoDescriptor): NavItem[] {
  return resolverNavegacion(contexto).flatMap((g) => g.items);
}
