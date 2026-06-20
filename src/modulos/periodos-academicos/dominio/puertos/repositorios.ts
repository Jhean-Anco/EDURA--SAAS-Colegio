import {
  AnioAcademico,
  EstadoAnioAcademico,
} from '../entidades/anio-academico';
import {
  PeriodoAcademico,
  EstadoPeriodoAcademico,
} from '../entidades/periodo-academico';

export interface RepositorioAniosAcademicos {
  guardar(anio: AnioAcademico): Promise<void>;
  buscarPorId(id: string, institucionId: string): Promise<AnioAcademico | null>;
  buscarPorAnio(
    anio: number,
    institucionId: string,
  ): Promise<AnioAcademico | null>;
  listar(institucionId: string): Promise<AnioAcademico[]>;
  actualizarEstado(
    id: string,
    institucionId: string,
    estado: EstadoAnioAcademico,
  ): Promise<void>;
}

export interface RepositorioPeriodosAcademicos {
  guardar(periodo: PeriodoAcademico): Promise<void>;
  buscarPorId(
    id: string,
    institucionId: string,
  ): Promise<PeriodoAcademico | null>;
  listarPorAnio(
    anioAcademicoId: string,
    institucionId: string,
  ): Promise<PeriodoAcademico[]>;
  actualizarEstado(
    id: string,
    institucionId: string,
    estado: EstadoPeriodoAcademico,
  ): Promise<void>;
}
