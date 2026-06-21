import { AnioAcademicoNoEncontradoError } from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioCalendarioAcademico,
} from '../../dominio/puertos/estructura-academica.puerto';

export interface EntradaActualizarAnioAcademico {
  id: string;
  nombre?: string;
  fechaInicio?: string;
  fechaFin?: string;
  observacion?: string | null;
}

export class ActualizarAnioAcademicoCasoUso {
  constructor(private readonly repositorio: RepositorioCalendarioAcademico) {}

  async ejecutar(
    entrada: EntradaActualizarAnioAcademico,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const anio = await this.repositorio.obtenerAnioBase(
      entrada.id,
      alcance.institucionId,
    );
    if (!anio) throw new AnioAcademicoNoEncontradoError();

    await this.repositorio.actualizarAnioAcademico({
      id: entrada.id,
      institucionId: alcance.institucionId,
      nombre: entrada.nombre,
      fechaInicio: entrada.fechaInicio,
      fechaFin: entrada.fechaFin,
      observacion: entrada.observacion,
    });
  }
}
