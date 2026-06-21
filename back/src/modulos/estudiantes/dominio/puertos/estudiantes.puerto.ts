import { EstadoEstudiante, EstudianteResumen } from '../estudiantes/estudiante';

export const CONSULTA_ESTUDIANTES = Symbol('CONSULTA_ESTUDIANTES');
export const REPOSITORIO_ESTUDIANTES = Symbol('REPOSITORIO_ESTUDIANTES');

export interface ListadoEstudiantesEntrada {
  institucionId: string;
  sedeId?: string | null;
  estado?: string | null;
  busqueda?: string | null;
  pagina: number;
  limite: number;
}

export interface FichaEstudiante {
  estudiante: {
    id: string;
    codigo: string;
    estado: EstadoEstudiante;
    fechaIngreso: string | null;
    fechaRetiro: string | null;
    observacion: string | null;
  };
  persona: {
    id: string;
    nombres: string;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
  };
  sede: { id: string; codigo: string; nombre: string };
  documentosIdentidadPersona: Array<{
    id: string;
    tipoDocumento: string;
    numero: string;
    esPrincipal: boolean;
    estado: string;
  }>;
  mediosContactoPersona: Array<{
    id: string;
    tipo: string;
    valor: string;
    esPrincipal: boolean;
    estado: string;
  }>;
  apoderados: Array<{
    id: string;
    idPersona: string;
    parentesco: string;
    esPrincipal: boolean;
    puedeRecoger: boolean;
    recibeComunicaciones: boolean;
    estado: string;
  }>;
  documentosAdministrativos: Array<{
    id: string;
    tipoDocumento: string;
    nombre: string;
    estado: string;
  }>;
}

export interface EstudiantesConsulta {
  listar(
    entrada: ListadoEstudiantesEntrada,
  ): Promise<{ datos: EstudianteResumen[]; total: number }>;
  obtener(id: string, institucionId: string): Promise<FichaEstudiante | null>;
}

export interface DatosEstudianteCreacion {
  id: string;
}

export interface RepositorioEstudiantes {
  verificarSedeDeInstitucion(
    idSede: string,
    institucionId: string,
  ): Promise<boolean>;
  verificarPersonaDeInstitucion(
    idPersona: string,
    institucionId: string,
  ): Promise<boolean>;
  existeCodigo(
    codigo: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;
  personaYaEsEstudiante(
    idPersona: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;
  crearEstudiante(entrada: {
    institucionId: string;
    idPersona: string;
    idSede: string;
    codigo: string;
    fechaIngreso?: string | null;
    observacion?: string | null;
  }): Promise<DatosEstudianteCreacion>;
  obtenerEstudianteBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; idSede: string; idPersona: string } | null>;
  actualizarEstudiante(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    idSede?: string | null;
    fechaIngreso?: string | null;
    observacion?: string | null;
  }): Promise<boolean>;
  cambiarEstadoEstudiante(
    id: string,
    institucionId: string,
    estado: string,
  ): Promise<boolean>;
  estudianteTienePrincipalActivo(
    estudianteId: string,
    institucionId: string,
  ): Promise<boolean>;
  apoderadoPrincipalActivo(
    estudianteId: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean>;
  crearApoderado(entrada: {
    institucionId: string;
    estudianteId: string;
    idPersona: string;
    parentesco: string;
    esPrincipal?: boolean;
    puedeRecoger?: boolean;
    recibeComunicaciones?: boolean;
  }): Promise<{ id: string }>;
  obtenerApoderadoBase(
    idApoderado: string,
    estudianteId: string,
    institucionId: string,
  ): Promise<{ id: string; esPrincipal: boolean } | null>;
  actualizarApoderado(entrada: {
    idApoderado: string;
    estudianteId: string;
    institucionId: string;
    parentesco?: string | null;
    esPrincipal?: boolean | null;
    puedeRecoger?: boolean | null;
    recibeComunicaciones?: boolean | null;
    estado?: string | null;
  }): Promise<boolean>;
  estudianteExiste(
    estudianteId: string,
    institucionId: string,
  ): Promise<boolean>;
  registrarDocumento(entrada: {
    institucionId: string;
    estudianteId: string;
    tipoDocumento: string;
    nombre: string;
    fechaEmision?: string | null;
    fechaVencimiento?: string | null;
    observacion?: string | null;
  }): Promise<void>;
}
