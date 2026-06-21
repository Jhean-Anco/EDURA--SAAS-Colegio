// Tipos derivados directamente de back/src/modulos/curriculo/dominio/

export type EstadoArea = 'ACTIVA' | 'INACTIVA';
export type EstadoAsignatura = 'ACTIVA' | 'INACTIVA';
export type EstadoPlan = 'BORRADOR' | 'APROBADO' | 'VIGENTE' | 'CERRADO' | 'ANULADO';
export type EstadoDetalle = 'ACTIVO' | 'INACTIVO';
export type TipoDetalle = 'OBLIGATORIA' | 'ELECTIVA';

// ── Áreas curriculares ──────────────────────────────────────────────────────

export interface AreaCurricular {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  estado: EstadoArea;
}

// ── Asignaturas ─────────────────────────────────────────────────────────────

export interface Asignatura {
  id: string;
  idAreaCurricular: string;
  nombreArea: string;
  codigo: string;
  nombre: string;
  nombreCorto: string | null;
  descripcion: string | null;
  orden: number;
  estado: EstadoAsignatura;
}

// ── Detalles del plan ───────────────────────────────────────────────────────

export interface DetallePlan {
  id: string;
  idAsignatura: string;
  codigoAsignatura: string;
  nombreAsignatura: string;
  nombreAreaCurricular: string;
  tipo: TipoDetalle;
  horasSemanales: number;
  horasAnuales: number;
  orden: number;
  estado: EstadoDetalle;
  observacion: string | null;
}

// ── Planes de estudio ───────────────────────────────────────────────────────

export interface PlanEstudioItem {
  id: string;
  codigo: string;
  nombre: string;
  version: number;
  estado: EstadoPlan;
  idAnioAcademico: string;
  anio: number;
  idGradoEducativo: string;
  nombreGrado: string;
  nombreNivel: string;
}

export interface PlanEstudio extends PlanEstudioItem {
  observacion: string | null;
  fechaAprobacion: string | null;
  idUsuarioAprobador: string | null;
  totalAsignaturasActivas: number;
  totalHorasSemanales: number;
  totalHorasAnuales: number;
  detalles: DetallePlan[];
}

// ── Catálogos auxiliares (estructura académica) ─────────────────────────────

export interface AnioAcademico {
  id: string;
  anio: number;
  codigo: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

export interface GradoEducativo {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  estado: string;
  idNivelEducativo: string;
  nombreNivel: string;
}

// ── Filtros de listado ───────────────────────────────────────────────────────

export interface FiltrosPlanes {
  idAnio?: string;
  idGrado?: string;
  estado?: EstadoPlan;
}

// ── Solicitudes de mutación ─────────────────────────────────────────────────

export interface CrearPlanSolicitud {
  idAnioAcademico: string;
  idGradoEducativo: string;
  codigo: string;
  nombre: string;
  observacion?: string | null;
}

export interface ActualizarPlanSolicitud {
  codigo?: string;
  nombre?: string;
  observacion?: string | null;
}

export interface CambiarEstadoPlanSolicitud {
  estado: EstadoPlan;
}

export interface DuplicarPlanSolicitud {
  idAnioAcademico?: string;
  codigo: string;
  nombre: string;
  observacion?: string | null;
}

export interface AgregarDetalleSolicitud {
  idAsignatura: string;
  tipo: TipoDetalle;
  horasSemanales: number;
  horasAnuales: number;
  orden: number;
  observacion?: string | null;
}

export interface ActualizarDetalleSolicitud {
  tipo?: TipoDetalle;
  horasSemanales?: number;
  horasAnuales?: number;
  orden?: number;
  observacion?: string | null;
}

export interface CambiarEstadoDetalleSolicitud {
  estado: EstadoDetalle;
}

// ── Máquina de estados ──────────────────────────────────────────────────────

export const TRANSICIONES_PLAN: Record<EstadoPlan, EstadoPlan[]> = {
  BORRADOR: ['ANULADO'],
  APROBADO: ['VIGENTE', 'ANULADO'],
  VIGENTE: ['CERRADO'],
  CERRADO: [],
  ANULADO: [],
};

export function transicionesValidas(estado: EstadoPlan): EstadoPlan[] {
  return TRANSICIONES_PLAN[estado] ?? [];
}

export function puedeEditarPlan(estado: EstadoPlan): boolean {
  return estado === 'BORRADOR';
}

export function puedeAprobarPlan(estado: EstadoPlan): boolean {
  return estado === 'BORRADOR';
}
