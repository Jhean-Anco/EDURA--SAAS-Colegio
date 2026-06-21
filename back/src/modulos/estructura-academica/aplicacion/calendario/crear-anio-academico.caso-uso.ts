import {
  AnioAcademicoYaExisteError,
  AnioEnCursoYaExisteError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoCalendario,
  RepositorioCalendarioAcademico,
} from '../../dominio/puertos/estructura-academica.puerto';

export interface EntradaCrearAnioAcademico {
  anio: number;
  codigo: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado?: EstadoCalendario;
  observacion?: string | null;
}

export class CrearAnioAcademicoCasoUso {
  constructor(private readonly repositorio: RepositorioCalendarioAcademico) {}

  async ejecutar(
    entrada: EntradaCrearAnioAcademico,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    const existeAnio = await this.repositorio.existeAnioEnInstitucion(
      entrada.anio,
      alcance.institucionId,
    );
    if (existeAnio) throw new AnioAcademicoYaExisteError();

    const codigoNormalizado = entrada.codigo.trim().toUpperCase();
    const existeCodigo = await this.repositorio.existeCodigoAnioEnInstitucion(
      codigoNormalizado,
      alcance.institucionId,
    );
    if (existeCodigo) throw new AnioAcademicoYaExisteError();

    if (entrada.estado === 'ACTIVO') {
      const hayActivo = await this.repositorio.existeAnioActivo(
        alcance.institucionId,
      );
      if (hayActivo) throw new AnioEnCursoYaExisteError();
    }

    return this.repositorio.crearAnioAcademico({
      institucionId: alcance.institucionId,
      anio: entrada.anio,
      codigo: entrada.codigo.trim(),
      codigoNormalizado,
      nombre: entrada.nombre.trim(),
      fechaInicio: entrada.fechaInicio,
      fechaFin: entrada.fechaFin,
      estado: entrada.estado ?? 'PLANIFICADO',
      observacion: entrada.observacion ?? null,
    });
  }
}
