import type {
  EstadoArea,
  EstadoAsignatura,
  EstadoPlan,
  EstadoDetalle,
  TipoDetalle,
} from '../curriculo.constantes';

export type {
  EstadoArea,
  EstadoAsignatura,
  EstadoPlan,
  EstadoDetalle,
  TipoDetalle,
};

export const REPOSITORIO_AREAS_CURRICULARES = Symbol(
  'REPOSITORIO_AREAS_CURRICULARES',
);
export const REPOSITORIO_ASIGNATURAS = Symbol('REPOSITORIO_ASIGNATURAS');
export const REPOSITORIO_PLANES_ESTUDIO = Symbol('REPOSITORIO_PLANES_ESTUDIO');
export const CONSULTADOR_CURRICULO = Symbol('CONSULTADOR_CURRICULO');

export interface AlcanceAcceso {
  usuarioId: string;
  institucionId: string;
  ambito: 'INSTITUCION' | 'SEDE';
  sedeId: string | null;
  correlationId?: string;
}

// ── Tipos de respuesta ────────────────────────────────────────────────────────

export interface AreaCurricularResumen {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  estado: EstadoArea;
}

export interface AsignaturaResumen {
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

export interface DetallePlanResumen {
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

export interface PlanEstudioResumen {
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
  observacion: string | null;
  fechaAprobacion: string | null;
  idUsuarioAprobador: string | null;
  totalAsignaturasActivas: number;
  totalHorasSemanales: number;
  totalHorasAnuales: number;
  detalles: DetallePlanResumen[];
}

export interface PlanEstudioListaItem {
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

// ── Repositorio Áreas Curriculares ────────────────────────────────────────────

export interface RepositorioAreasCurriculares {
  existeCodigoAreaEnInstitucion(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeNombreAreaEnInstitucion(
    nombreNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeOrdenAreaEnInstitucion(
    orden: number,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  crearArea(entrada: {
    institucionId: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    nombreNormalizado: string;
    descripcion?: string | null;
    orden: number;
  }): Promise<{ id: string }>;

  obtenerAreaBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoArea } | null>;

  actualizarArea(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    nombreNormalizado?: string;
    descripcion?: string | null;
    orden?: number;
  }): Promise<boolean>;

  cambiarEstadoArea(
    id: string,
    institucionId: string,
    estado: EstadoArea,
  ): Promise<boolean>;

  tieneAsignaturasActivas(
    idArea: string,
    institucionId: string,
  ): Promise<boolean>;
}

// ── Repositorio Asignaturas ───────────────────────────────────────────────────

export interface RepositorioAsignaturas {
  existeAreaEnInstitucion(
    idArea: string,
    institucionId: string,
  ): Promise<boolean>;

  existeCodigoAsignaturaEnInstitucion(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeOrdenAsignaturaEnArea(
    orden: number,
    idArea: string,
    excluirId?: string,
  ): Promise<boolean>;

  crearAsignatura(entrada: {
    institucionId: string;
    idAreaCurricular: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    nombreCorto?: string | null;
    descripcion?: string | null;
    orden: number;
  }): Promise<{ id: string }>;

  obtenerAsignaturaBase(
    id: string,
    institucionId: string,
  ): Promise<{
    id: string;
    estado: EstadoAsignatura;
    idAreaCurricular: string;
  } | null>;

  actualizarAsignatura(entrada: {
    id: string;
    institucionId: string;
    idAreaCurricular?: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    nombreCorto?: string | null;
    descripcion?: string | null;
    orden?: number;
  }): Promise<boolean>;

  cambiarEstadoAsignatura(
    id: string,
    institucionId: string,
    estado: EstadoAsignatura,
  ): Promise<boolean>;

  estaAsignaturaEnPlanActivo(
    idAsignatura: string,
    institucionId: string,
  ): Promise<boolean>;

  esAreaDeOtraInstitucion(
    idArea: string,
    idAsignatura: string,
    institucionId: string,
  ): Promise<boolean>;
}

// ── Repositorio Planes de Estudio ─────────────────────────────────────────────

export interface RepositorioPlanesEstudio {
  existeAnioEnInstitucion(
    idAnio: string,
    institucionId: string,
  ): Promise<boolean>;
  existeGradoEnInstitucion(
    idGrado: string,
    institucionId: string,
  ): Promise<boolean>;

  obtenerEstadoAnio(
    idAnio: string,
    institucionId: string,
  ): Promise<string | null>;

  existeCodigoPlanEnInstitucion(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeVersionPlanEnAnioGrado(
    version: number,
    idAnio: string,
    idGrado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  obtenerSiguienteVersionPlan(
    idAnio: string,
    idGrado: string,
    institucionId: string,
  ): Promise<number>;

  crearPlan(entrada: {
    institucionId: string;
    idAnioAcademico: string;
    idGradoEducativo: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    version: number;
    observacion?: string | null;
  }): Promise<{ id: string }>;

  obtenerPlanBase(
    id: string,
    institucionId: string,
  ): Promise<{
    id: string;
    estado: EstadoPlan;
    idAnioAcademico: string;
    idGradoEducativo: string;
  } | null>;

  actualizarPlan(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    observacion?: string | null;
  }): Promise<boolean>;

  cambiarEstadoPlan(
    id: string,
    institucionId: string,
    estado: EstadoPlan,
    aprobacion?: { fechaAprobacion: string; idUsuarioAprobador: string },
    activacion?: { fechaVigencia: string; idUsuarioActivador: string },
  ): Promise<boolean>;

  existePlanVigenteParaAnioGrado(
    idAnio: string,
    idGrado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  contarDetallesActivos(idPlan: string, institucionId: string): Promise<number>;

  tieneAsignaturasInactivasEnDetalle(
    idPlan: string,
    institucionId: string,
  ): Promise<boolean>;

  // Detalles
  existeAsignaturaEnPlan(
    idAsignatura: string,
    idPlan: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeOrdenDetalleEnPlan(
    orden: number,
    idPlan: string,
    excluirId?: string,
  ): Promise<boolean>;

  agregarDetalle(entrada: {
    institucionId: string;
    idPlanEstudio: string;
    idAsignatura: string;
    tipo: TipoDetalle;
    horasSemanales: number;
    horasAnuales: number;
    orden: number;
    observacion?: string | null;
  }): Promise<{ id: string }>;

  obtenerDetalleBase(
    id: string,
    idPlan: string,
    institucionId: string,
  ): Promise<{
    id: string;
    estado: EstadoDetalle;
    idPlanEstudio: string;
  } | null>;

  actualizarDetalle(entrada: {
    id: string;
    institucionId: string;
    tipo?: TipoDetalle;
    horasSemanales?: number;
    horasAnuales?: number;
    orden?: number;
    observacion?: string | null;
  }): Promise<boolean>;

  cambiarEstadoDetalle(
    id: string,
    idPlan: string,
    institucionId: string,
    estado: EstadoDetalle,
  ): Promise<boolean>;

  duplicarPlan(entrada: {
    idPlanOrigen: string;
    institucionId: string;
    idAnioAcademico: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    version: number;
    observacion?: string | null;
  }): Promise<{ id: string }>;
}

// ── Consultador Currículo ─────────────────────────────────────────────────────

export interface ConsultadorCurriculo {
  listarAreas(
    institucionId: string,
    estado?: EstadoArea | null,
  ): Promise<AreaCurricularResumen[]>;

  obtenerArea(
    id: string,
    institucionId: string,
  ): Promise<AreaCurricularResumen | null>;

  listarAsignaturas(
    institucionId: string,
    idArea?: string | null,
    estado?: EstadoAsignatura | null,
  ): Promise<AsignaturaResumen[]>;

  obtenerAsignatura(
    id: string,
    institucionId: string,
  ): Promise<AsignaturaResumen | null>;

  listarPlanes(
    institucionId: string,
    idAnio?: string | null,
    idGrado?: string | null,
    estado?: EstadoPlan | null,
  ): Promise<PlanEstudioListaItem[]>;

  obtenerPlan(
    id: string,
    institucionId: string,
  ): Promise<PlanEstudioResumen | null>;

  resolverPlanVigente(
    idAnio: string,
    idGrado: string,
    institucionId: string,
  ): Promise<PlanEstudioResumen | null>;
}
