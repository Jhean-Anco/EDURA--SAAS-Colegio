import {
  Matricula,
  HistorialEstado,
  HistorialSeccion,
  AlcanceAcceso,
} from '../matriculas/matricula';

export interface FiltrosListarMatriculas {
  idSede?: string;
  idAnioAcademico?: string;
  idNivelEducativo?: string;
  idGradoEducativo?: string;
  idSeccion?: string;
  idEstudiante?: string;
  estado?: string;
  busqueda?: string;
  pagina?: number;
  tamano?: number;
}

export interface DetalleSeccionBloqueada {
  id: string;
  capacidadMaxima: number | null;
  idSede: string;
  idAnioAcademico: string;
  idGradoEducativo: string;
  idOfertaGradoSede: string;
  estado: string;
}

export const MATRICULAS_REPOSITORIO = 'MATRICULAS_REPOSITORIO';

export interface MatriculasPuerto {
  guardar(matricula: Matricula, manager?: any): Promise<void>;
  buscarPorId(
    id: string,
    alcance: AlcanceAcceso,
    manager?: any,
  ): Promise<Matricula | null>;
  listar(
    filtros: FiltrosListarMatriculas,
    alcance: AlcanceAcceso,
  ): Promise<{ total: number; datos: Matricula[] }>;
  estudianteTieneMatriculaActiva(
    idInstitucion: string,
    idEstudiante: string,
    idAnio: string,
    exceptoMatriculaId?: string,
    manager?: any,
  ): Promise<boolean>;
  obtenerSeccionConBloqueo(
    idSeccion: string,
    manager: any,
  ): Promise<DetalleSeccionBloqueada | null>;
  contarMatriculasActivasEnSeccion(
    idSeccion: string,
    manager?: any,
  ): Promise<number>;
  registrarHistorialEstado(
    historial: HistorialEstado,
    manager?: any,
  ): Promise<void>;
  registrarHistorialSeccion(
    historial: HistorialSeccion,
    manager?: any,
  ): Promise<void>;
  obtenerHistorialEstados(
    idMatricula: string,
    alcance: AlcanceAcceso,
  ): Promise<HistorialEstado[]>;
  obtenerHistorialSecciones(
    idMatricula: string,
    alcance: AlcanceAcceso,
  ): Promise<HistorialSeccion[]>;
  ejecutarTransaccion<T>(operacion: (manager: any) => Promise<T>): Promise<T>;

  // Helpers de verificacion
  verificarEstudiante(
    idEstudiante: string,
    idInstitucion: string,
  ): Promise<{ id: string; estado: string; idSede: string } | null>;
  verificarAnioAcademico(
    idAnio: string,
    idInstitucion: string,
  ): Promise<{ id: string; estado: string } | null>;
  verificarOfertaGradoSede(
    idOferta: string,
    idInstitucion: string,
  ): Promise<{
    id: string;
    idSede: string;
    idAnioAcademico: string;
    idGradoEducativo: string;
    estado: string;
  } | null>;
  verificarGrado(
    idGrado: string,
    idInstitucion: string,
  ): Promise<{ id: string; idNivelEducativo: string; estado: string } | null>;
  verificarSede(
    idSede: string,
    idInstitucion: string,
  ): Promise<{ id: string; estado: string } | null>;
  verificarSeccion(
    idSeccion: string,
    idInstitucion: string,
  ): Promise<{ id: string; idOfertaGradoSede: string; estado: string } | null>;
  existeCodigoMatricula(
    codigo: string,
    idInstitucion: string,
    exceptoMatriculaId?: string,
  ): Promise<boolean>;
}
