export const ESTADOS_AREA = ['ACTIVA', 'INACTIVA'] as const;
export const ESTADOS_ASIGNATURA = ['ACTIVA', 'INACTIVA'] as const;
export const ESTADOS_PLAN = [
  'BORRADOR',
  'APROBADO',
  'VIGENTE',
  'CERRADO',
  'ANULADO',
] as const;
export const ESTADOS_DETALLE = ['ACTIVO', 'INACTIVO'] as const;
export const TIPOS_DETALLE = ['OBLIGATORIA', 'ELECTIVA'] as const;

export type EstadoArea = (typeof ESTADOS_AREA)[number];
export type EstadoAsignatura = (typeof ESTADOS_ASIGNATURA)[number];
export type EstadoPlan = (typeof ESTADOS_PLAN)[number];
export type EstadoDetalle = (typeof ESTADOS_DETALLE)[number];
export type TipoDetalle = (typeof TIPOS_DETALLE)[number];
