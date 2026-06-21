export const REPOSITORIO_DOCENTES = Symbol('REPOSITORIO_DOCENTES');
export const CONSULTADOR_DOCENTES = Symbol('CONSULTADOR_DOCENTES');
export const REPOSITORIO_ESPECIALIDADES_PROFESIONALES = Symbol(
  'REPOSITORIO_ESPECIALIDADES_PROFESIONALES',
);

export const ESTADOS_DOCENTE = ['ACTIVO', 'INACTIVO', 'CESADO'] as const;
export type EstadoDocente = (typeof ESTADOS_DOCENTE)[number];

export const ESTADOS_ASIGNACION_SEDE = ['ACTIVA', 'INACTIVA'] as const;
export const ESTADOS_ESPECIALIDAD_PROF = ['ACTIVA', 'INACTIVA'] as const;

export interface AlcanceAcceso {
  usuarioId: string;
  institucionId: string;
  ambito: 'INSTITUCION' | 'SEDE';
  sedeId: string | null;
}

export interface DocenteResumen {
  id: string;
  codigo: string;
  estado: string;
  persona: {
    id: string;
    nombres: string;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
  };
  sedePrincipal: { id: string; nombre: string } | null;
  especialidadPrincipal: { id: string; nombre: string } | null;
}

export interface FichaDocente {
  docente: {
    id: string;
    codigo: string;
    estado: string;
    fechaIngreso: string | null;
    fechaCese: string | null;
    perfilProfesional: string | null;
    observacion: string | null;
  };
  persona: {
    id: string;
    nombres: string;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    documentoPrincipal: { tipo: string; numero: string } | null;
  };
  sedes: Array<{
    id: string;
    idSede: string;
    nombreSede: string;
    esPrincipal: boolean;
    estado: string;
    fechaInicio: string;
    fechaFin: string | null;
  }>;
  especialidades: Array<{
    id: string;
    idEspecialidad: string;
    nombreEspecialidad: string;
    esPrincipal: boolean;
    aniosExperiencia: number | null;
    estado: string;
  }>;
  situacionCuenta: 'TIENE_CUENTA' | 'SIN_CUENTA';
}

export interface EspecialidadProfesionalResumen {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
}

// ── Puerto de consulta ────────────────────────────────────────────────────────

export interface ConsultadorDocentes {
  listar(entrada: {
    alcance: AlcanceAcceso;
    idSede?: string | null;
    idEspecialidad?: string | null;
    estado?: string | null;
    busqueda?: string | null;
    pagina: number;
    limite: number;
  }): Promise<{ datos: DocenteResumen[]; total: number }>;

  obtener(id: string, alcance: AlcanceAcceso): Promise<FichaDocente | null>;

  obtenerPorPersona(
    idPersona: string,
    institucionId: string,
  ): Promise<FichaDocente | null>;

  listarEspecialidades(
    institucionId: string,
    estado?: string | null,
  ): Promise<EspecialidadProfesionalResumen[]>;
}

// ── Puerto de repositorio ─────────────────────────────────────────────────────

export interface DatosCreacionDocente {
  institucionId: string;
  idPersona: string;
  codigo: string;
  codigoNormalizado: string;
  fechaIngreso?: string | null;
  perfilProfesional?: string | null;
  observacion?: string | null;
}

export interface RepositorioDocentes {
  verificarPersonaEnInstitucion(
    idPersona: string,
    institucionId: string,
  ): Promise<boolean>;

  verificarSedeEnInstitucion(
    idSede: string,
    institucionId: string,
  ): Promise<boolean>;

  existeCodigoNormalizado(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  personaYaEsDocente(
    idPersona: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  crearDocente(datos: DatosCreacionDocente): Promise<{ id: string }>;

  obtenerDocenteBase(
    id: string,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string; estado: string; idPersona: string } | null>;

  actualizarDocente(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    fechaIngreso?: string | null;
    fechaCese?: string | null;
    perfilProfesional?: string | null;
    observacion?: string | null;
  }): Promise<boolean>;

  cambiarEstadoDocente(
    id: string,
    institucionId: string,
    estado: string,
    fechaCese?: string | null,
  ): Promise<boolean>;

  inactivarAsignacionesDocente(
    idDocente: string,
    institucionId: string,
  ): Promise<void>;

  contarSedesActivas(idDocente: string, institucionId: string): Promise<number>;

  crearAsignacionSede(entrada: {
    institucionId: string;
    idDocente: string;
    idSede: string;
    esPrincipal: boolean;
    fechaInicio: string;
    observacion?: string | null;
  }): Promise<{ id: string }>;

  obtenerAsignacionSedeBase(
    idAsignacion: string,
    idDocente: string,
    institucionId: string,
  ): Promise<{ id: string; esPrincipal: boolean; estado: string } | null>;

  actualizarAsignacionSede(entrada: {
    idAsignacion: string;
    idDocente: string;
    institucionId: string;
    esPrincipal?: boolean;
    fechaFin?: string | null;
    estado?: string;
    observacion?: string | null;
  }): Promise<boolean>;

  existeAsignacionActivaEnSede(
    idDocente: string,
    idSede: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeSedePrincipalActiva(
    idDocente: string,
    excluirId?: string,
  ): Promise<boolean>;

  quitarPrincipalAsignacionesSede(
    idDocente: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<void>;

  docenteTieneAsignacionEnSede(
    idDocente: string,
    idSede: string,
    institucionId: string,
  ): Promise<boolean>;
}

// ── Puerto de repositorio de especialidades ───────────────────────────────────

export interface RepositorioEspecialidadesProfesionales {
  existeCodigoNormalizadoEsp(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeNombreNormalizadoEsp(
    nombreNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;

  crearEspecialidad(entrada: {
    institucionId: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    nombreNormalizado: string;
    descripcion?: string | null;
  }): Promise<{ id: string }>;

  obtenerEspecialidadBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: string } | null>;

  actualizarEspecialidad(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    nombreNormalizado?: string;
    descripcion?: string | null;
    estado?: string;
  }): Promise<boolean>;

  docenteTieneEspecialidadActiva(
    idDocente: string,
    idEspecialidad: string,
    excluirId?: string,
  ): Promise<boolean>;

  existeEspecialidadPrincipalActiva(
    idDocente: string,
    excluirId?: string,
  ): Promise<boolean>;

  crearAsignacionEspecialidad(entrada: {
    institucionId: string;
    idDocente: string;
    idEspecialidad: string;
    esPrincipal: boolean;
    aniosExperiencia?: number | null;
  }): Promise<{ id: string }>;

  obtenerAsignacionEspecialidadBase(
    idAsignacion: string,
    idDocente: string,
    institucionId: string,
  ): Promise<{ id: string; esPrincipal: boolean; estado: string } | null>;

  actualizarAsignacionEspecialidad(entrada: {
    idAsignacion: string;
    idDocente: string;
    institucionId: string;
    esPrincipal?: boolean;
    aniosExperiencia?: number | null;
    estado?: string;
  }): Promise<boolean>;

  quitarPrincipalAsignacionesEspecialidad(
    idDocente: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<void>;
}
