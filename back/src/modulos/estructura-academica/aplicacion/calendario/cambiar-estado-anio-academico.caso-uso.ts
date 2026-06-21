import {
  AnioAcademicoNoEncontradoError,
  AnioEnCursoYaExisteError,
  TransicionAnioInvalidaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoCalendario,
  RepositorioCalendarioAcademico,
} from '../../dominio/puertos/estructura-academica.puerto';

const TRANSICIONES_VALIDAS: Record<EstadoCalendario, EstadoCalendario[]> = {
  PLANIFICADO: ['ACTIVO', 'ANULADO'],
  ACTIVO: ['CERRADO', 'ANULADO'],
  CERRADO: [],
  ANULADO: [],
};

export class CambiarEstadoAnioAcademicoCasoUso {
  constructor(private readonly repositorio: RepositorioCalendarioAcademico) {}

  async ejecutar(
    id: string,
    nuevoEstado: EstadoCalendario,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const anio = await this.repositorio.obtenerAnioBase(
      id,
      alcance.institucionId,
    );
    if (!anio) throw new AnioAcademicoNoEncontradoError();

    const permitidos = TRANSICIONES_VALIDAS[anio.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new TransicionAnioInvalidaError(anio.estado, nuevoEstado);
    }

    if (nuevoEstado === 'ACTIVO') {
      const hayActivo = await this.repositorio.existeAnioActivo(
        alcance.institucionId,
      );
      if (hayActivo) throw new AnioEnCursoYaExisteError();
    }

    await this.repositorio.cambiarEstadoAnio(
      id,
      alcance.institucionId,
      nuevoEstado,
    );
  }
}
