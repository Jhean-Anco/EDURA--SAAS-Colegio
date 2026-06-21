export const ESTADOS_CALENDARIO = [
  'PLANIFICADO',
  'ACTIVO',
  'CERRADO',
  'ANULADO',
] as const;

export const TIPOS_PERIODO = [
  'BIMESTRE',
  'TRIMESTRE',
  'SEMESTRE',
  'CUATRIMESTRE',
  'OTRO',
] as const;

export const ESTADOS_NIVEL = ['ACTIVO', 'INACTIVO'] as const;

export const ESTADOS_OFERTA = [
  'PLANIFICADA',
  'ACTIVA',
  'CERRADA',
  'CANCELADA',
] as const;

export const ESTADOS_SECCION = [
  'PLANIFICADA',
  'ACTIVA',
  'CERRADA',
  'INACTIVA',
] as const;

export const TURNOS_SECCION = [
  'MANANA',
  'TARDE',
  'NOCHE',
  'COMPLETO',
  'OTRO',
] as const;

export type EstadoCalendario = (typeof ESTADOS_CALENDARIO)[number];
export type TipoPeriodo = (typeof TIPOS_PERIODO)[number];
export type EstadoNivel = (typeof ESTADOS_NIVEL)[number];
export type EstadoOferta = (typeof ESTADOS_OFERTA)[number];
export type EstadoSeccion = (typeof ESTADOS_SECCION)[number];
export type TurnoSeccion = (typeof TURNOS_SECCION)[number];
