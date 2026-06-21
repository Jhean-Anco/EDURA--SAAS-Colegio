export interface AlcanceAcceso {
  usuarioId: string;
  institucionId: string;
  ambito: 'INSTITUCION' | 'SEDE';
  sedeId: string | null;
  correlationId?: string;
}

export const REPOSITORIO_CALENDARIO_ACADEMICO = Symbol(
  'REPOSITORIO_CALENDARIO_ACADEMICO',
);
export const REPOSITORIO_CATALOGOS_ACADEMICOS = Symbol(
  'REPOSITORIO_CATALOGOS_ACADEMICOS',
);
export const REPOSITORIO_OFERTA_ACADEMICA = Symbol(
  'REPOSITORIO_OFERTA_ACADEMICA',
);
export const CONSULTADOR_ESTRUCTURA_ACADEMICA = Symbol(
  'CONSULTADOR_ESTRUCTURA_ACADEMICA',
);

import {
  EstadoCalendario,
  TipoPeriodo,
  EstadoNivel,
  EstadoOferta,
  EstadoSeccion,
  TurnoSeccion,
} from '../estructura-academica.constantes';

export type {
  EstadoCalendario,
  TipoPeriodo,
  EstadoNivel,
  EstadoOferta,
  EstadoSeccion,
  TurnoSeccion,
};

// ── Interfaces de resumen ─────────────────────────────────────────────────────

export interface AnioAcademicoResumen {
  id: string;
  anio: number;
  codigo: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoCalendario;
}

export interface PeriodoAcademicoResumen {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoPeriodo;
  orden: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoCalendario;
  idAnioAcademico: string;
}

export interface NivelEducativoResumen {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  estado: EstadoNivel;
}

export interface GradoEducativoResumen {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  estado: EstadoNivel;
  idNivelEducativo: string;
  nombreNivel: string;
}

export interface OfertaGradoSedeResumen {
  id: string;
  idSede: string;
  nombreSede: string;
  idGradoEducativo: string;
  nombreGrado: string;
  idAnioAcademico: string;
  anio: number;
  capacidadReferencial: number | null;
  estado: EstadoOferta;
}

export interface SeccionAcademicaResumen {
  id: string;
  codigo: string;
  nombre: string;
  turno: string;
  capacidadMaxima: number | null;
  estado: EstadoSeccion;
  idOfertaGradoSede: string;
  idDocenteTutor: string | null;
  nombreDocenteTutor: string | null;
  idEspacioFisico: string | null;
  nombreEspacioFisico: string | null;
}

export interface PeriodoActivoPanel {
  id: string;
  nombre: string;
  tipo: TipoPeriodo;
  fechaInicio: string;
  fechaFin: string;
  anio: number;
}

// ── Repositorio Calendario Académico ─────────────────────────────────────────

export interface RepositorioCalendarioAcademico {
  existeAnioEnInstitucion(
    anio: number,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeCodigoAnioEnInstitucion(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeAnioActivo(institucionId: string): Promise<boolean>;

  crearAnioAcademico(entrada: {
    institucionId: string;
    anio: number;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    estado: EstadoCalendario;
    observacion?: string | null;
  }): Promise<{ id: string }>;

  obtenerAnioBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoCalendario; anio: number } | null>;

  obtenerFechasAnio(
    id: string,
    institucionId: string,
  ): Promise<{ fechaInicio: string; fechaFin: string } | null>;

  existePeriodoFueraDeIntervalo(
    idAnio: string,
    institucionId: string,
    nuevaFechaInicio: string,
    nuevaFechaFin: string,
  ): Promise<boolean>;

  actualizarAnioAcademico(entrada: {
    id: string;
    institucionId: string;
    nombre?: string;
    fechaInicio?: string;
    fechaFin?: string;
    observacion?: string | null;
  }): Promise<boolean>;

  cambiarEstadoAnio(
    id: string,
    institucionId: string,
    estado: EstadoCalendario,
  ): Promise<boolean>;

  existePeriodoActivoEnAnio(
    idAnio: string,
    institucionId: string,
  ): Promise<boolean>;

  existeCodigoPeriodoEnAnio(
    codigoNormalizado: string,
    idAnio: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeOrdenPeriodoEnAnio(
    orden: number,
    idAnio: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeSolapamientoPeriodo(entrada: {
    idAnio: string;
    institucionId: string;
    fechaInicio: string;
    fechaFin: string;
    excluirId?: string;
  }): Promise<boolean>;

  crearPeriodoAcademico(entrada: {
    institucionId: string;
    idAnioAcademico: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    tipo: TipoPeriodo;
    orden: number;
    fechaInicio: string;
    fechaFin: string;
    observacion?: string | null;
  }): Promise<{ id: string }>;

  obtenerPeriodoBase(
    id: string,
    idAnio: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoCalendario } | null>;

  obtenerPeriodoFechas(
    id: string,
    idAnio: string,
    institucionId: string,
  ): Promise<{ fechaInicio: string; fechaFin: string } | null>;

  actualizarPeriodoAcademico(entrada: {
    id: string;
    idAnioAcademico: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    tipo?: TipoPeriodo;
    orden?: number;
    fechaInicio?: string;
    fechaFin?: string;
    observacion?: string | null;
  }): Promise<boolean>;

  cambiarEstadoPeriodo(
    id: string,
    idAnio: string,
    institucionId: string,
    estado: EstadoCalendario,
  ): Promise<boolean>;
}

// ── Repositorio Catálogos Académicos ─────────────────────────────────────────

export interface RepositorioCatalogosAcademicos {
  existeCodigoNivelEnInstitucion(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeOrdenNivelEnInstitucion(
    orden: number,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  crearNivelEducativo(entrada: {
    institucionId: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    descripcion?: string | null;
    orden: number;
  }): Promise<{ id: string }>;

  obtenerNivelBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoNivel } | null>;

  actualizarNivelEducativo(entrada: {
    id: string;
    institucionId: string;
    nombre?: string;
    descripcion?: string | null;
    orden?: number;
    estado?: EstadoNivel;
  }): Promise<boolean>;

  cambiarEstadoNivel(
    id: string,
    institucionId: string,
    estado: EstadoNivel,
  ): Promise<boolean>;

  tieneGradosActivos(idNivel: string, institucionId: string): Promise<boolean>;

  existeCodigoGradoEnNivel(
    codigoNormalizado: string,
    idNivel: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeOrdenGradoEnNivel(
    orden: number,
    idNivel: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  crearGradoEducativo(entrada: {
    institucionId: string;
    idNivelEducativo: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    descripcion?: string | null;
    orden: number;
  }): Promise<{ id: string }>;

  obtenerGradoBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoNivel; idNivel: string } | null>;

  actualizarGradoEducativo(entrada: {
    id: string;
    institucionId: string;
    nombre?: string;
    descripcion?: string | null;
    orden?: number;
    estado?: EstadoNivel;
  }): Promise<boolean>;

  cambiarEstadoGrado(
    id: string,
    institucionId: string,
    estado: EstadoNivel,
  ): Promise<boolean>;

  tieneOfertasActivasOPlanificadas(
    idGrado: string,
    institucionId: string,
  ): Promise<boolean>;
}

// ── Repositorio Oferta Académica ──────────────────────────────────────────────

export interface RepositorioOfertaAcademica {
  existeOfertaEnSede(entrada: {
    idSede: string;
    idGrado: string;
    idAnio: string;
    institucionId: string;
    excluirId?: string;
  }): Promise<boolean>;

  crearOfertaGradoSede(entrada: {
    institucionId: string;
    idSede: string;
    idGradoEducativo: string;
    idAnioAcademico: string;
    capacidadReferencial?: number | null;
  }): Promise<{ id: string }>;

  obtenerOfertaBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: EstadoOferta; idSede: string } | null>;

  actualizarOferta(entrada: {
    id: string;
    institucionId: string;
    capacidadReferencial?: number | null;
    estado?: EstadoOferta;
  }): Promise<boolean>;

  cambiarEstadoOferta(
    id: string,
    institucionId: string,
    estado: EstadoOferta,
  ): Promise<boolean>;

  tieneSeccionesActivasEnOferta(
    idOferta: string,
    institucionId: string,
  ): Promise<boolean>;

  existeOfertaActivaOPlanificadaEnAnio(
    idAnio: string,
    institucionId: string,
  ): Promise<boolean>;

  existeSeccionEnOferta(
    codigoNormalizado: string,
    idOferta: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  crearSeccionAcademica(entrada: {
    institucionId: string;
    idOfertaGradoSede: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    turno: string;
    capacidadMaxima?: number | null;
    idDocenteTutor?: string | null;
    idEspacioFisico?: string | null;
  }): Promise<{ id: string }>;

  obtenerSeccionBase(
    id: string,
    institucionId: string,
  ): Promise<{
    id: string;
    estado: EstadoSeccion;
    idOfertaGradoSede: string;
    idSede: string;
    capacidadMaxima: number | null;
  } | null>;

  actualizarSeccion(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    turno?: string;
    capacidadMaxima?: number | null;
    idDocenteTutor?: string | null;
    idEspacioFisico?: string | null;
    estado?: EstadoSeccion;
  }): Promise<boolean>;

  cambiarEstadoSeccion(
    id: string,
    institucionId: string,
    estado: EstadoSeccion,
  ): Promise<boolean>;

  verificarEspacioFisicoEnSede(
    idEspacioFisico: string,
    idSede: string,
  ): Promise<{
    esAula: boolean;
    estaActivo: boolean;
    aforo: number | null;
  } | null>;

  verificarDocenteTutorEnSede(
    idDocente: string,
    idSede: string,
    institucionId: string,
  ): Promise<{
    estaActivo: boolean;
    estaCesado: boolean;
    tieneAsignacion: boolean;
  }>;
}

// ── Consultador Estructura Académica ─────────────────────────────────────────

export interface ConsultadorEstructuraAcademica {
  listarAnios(
    institucionId: string,
    estado?: EstadoCalendario | null,
  ): Promise<AnioAcademicoResumen[]>;

  listarPeriodos(
    idAnio: string,
    institucionId: string,
    estado?: EstadoCalendario | null,
  ): Promise<PeriodoAcademicoResumen[]>;

  listarNiveles(
    institucionId: string,
    estado?: EstadoNivel | null,
  ): Promise<NivelEducativoResumen[]>;

  listarGrados(
    institucionId: string,
    idNivel?: string | null,
    estado?: EstadoNivel | null,
  ): Promise<GradoEducativoResumen[]>;

  listarOfertas(
    institucionId: string,
    idSede?: string | null,
    idAnio?: string | null,
    estado?: EstadoOferta | null,
  ): Promise<OfertaGradoSedeResumen[]>;

  listarSecciones(
    idOferta: string,
    institucionId: string,
  ): Promise<SeccionAcademicaResumen[]>;

  obtenerPeriodoActivo(
    institucionId: string,
  ): Promise<PeriodoActivoPanel | null>;
}
