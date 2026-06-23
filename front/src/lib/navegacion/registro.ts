import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Building2,
  Warehouse,
  Users,
  UserCheck,
  Briefcase,
  Calendar,
  ClipboardCheck
} from 'lucide-react';
import type { NavGroup, NavItem } from '@/types/navegacion';
import type { ContextoDescriptor } from '@/types/auth';

export const GRUPOS_NAVEGACION: NavGroup[] = [
  {
    etiqueta: 'Inicio',
    items: [
      {
        codigo: 'panel-plataforma',
        etiqueta: 'Panel',
        ruta: '/panel',
        icono: LayoutDashboard,
        permisos: [],
        ambitos: ['PLATAFORMA'],
      },
      {
        codigo: 'panel',
        etiqueta: 'Panel',
        ruta: '/panel',
        icono: LayoutDashboard,
        permisos: ['PANEL_INSTITUCIONAL.RESUMEN.LEER'],
        ambitos: ['INSTITUCION', 'SEDE'],
      },
      {
        codigo: 'panel-estudiante',
        etiqueta: 'Mi Panel',
        ruta: '/panel',
        icono: LayoutDashboard,
        permisos: ['ESTUDIANTES.MI_PERFIL.LEER'],
        ambitos: ['SEDE'],
      },
      {
        codigo: 'panel-apoderado',
        etiqueta: 'Mi Panel',
        ruta: '/panel',
        icono: LayoutDashboard,
        permisos: ['APODERADOS.MIS_ESTUDIANTES.LEER'],
        ambitos: ['INSTITUCION'],
      },
    ],
  },
  {
    etiqueta: 'Institución',
    items: [
      {
        codigo: 'institucion-detalle',
        etiqueta: 'Mi Institución',
        ruta: '/panel/institucion',
        icono: Building2,
        permisos: ['INSTITUCIONES.LEER'],
        ambitos: ['INSTITUCION'],
      },
      {
        codigo: 'sedes-listado',
        etiqueta: 'Sedes',
        ruta: '/panel/sedes',
        icono: Building2,
        permisos: ['SEDES.LEER'],
        ambitos: ['INSTITUCION', 'SEDE'],
      },
      {
        codigo: 'infraestructura-espacios',
        etiqueta: 'Infraestructura',
        ruta: '/panel/infraestructura',
        icono: Warehouse,
        permisos: ['INFRAESTRUCTURA.LEER'],
        ambitos: ['SEDE'],
      },
    ],
  },
  {
    etiqueta: 'Comunidad',
    items: [
      {
        codigo: 'personas-listado',
        etiqueta: 'Personas',
        ruta: '/panel/personas',
        icono: Users,
        permisos: ['PERSONAS.LEER'],
        ambitos: ['INSTITUCION', 'SEDE'],
      },
      {
        codigo: 'estudiantes-listado',
        etiqueta: 'Estudiantes',
        ruta: '/panel/estudiantes',
        icono: UserCheck,
        permisos: ['ESTUDIANTES.LEER'],
        ambitos: ['SEDE'],
      },
      {
        codigo: 'docentes-listado',
        etiqueta: 'Docentes',
        ruta: '/panel/docentes',
        icono: Briefcase,
        permisos: ['DOCENTES.LEER'],
        ambitos: ['SEDE'],
      },
    ],
  },
  {
    etiqueta: 'Planificación',
    items: [
      {
        codigo: 'estructura-calendario',
        etiqueta: 'Calendario Escolar',
        ruta: '/panel/estructura-academica/calendario',
        icono: Calendar,
        permisos: ['ESTRUCTURA_ACADEMICA.LEER'],
        ambitos: ['INSTITUCION'],
      },
      {
        codigo: 'estructura-secciones',
        etiqueta: 'Secciones y Oferta',
        ruta: '/panel/estructura-academica/secciones',
        icono: GraduationCap,
        permisos: ['ESTRUCTURA_ACADEMICA.LEER'],
        ambitos: ['SEDE'],
      },
      {
        codigo: 'curriculo-planes',
        etiqueta: 'Planes de estudio',
        ruta: '/panel/curriculo/planes-estudio',
        icono: BookOpen,
        permisos: ['CURRICULO.LEER'],
        ambitos: ['INSTITUCION'],
      },
    ],
  },
  {
    etiqueta: 'Operación',
    items: [
      {
        codigo: 'matriculas-gestion',
        etiqueta: 'Matrículas',
        ruta: '/panel/matriculas',
        icono: ClipboardCheck,
        permisos: ['MATRICULAS.LEER'],
        ambitos: ['SEDE'],
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
