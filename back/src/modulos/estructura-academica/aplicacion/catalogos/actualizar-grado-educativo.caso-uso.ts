import { GradoEducativoNoEncontradoError } from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoNivel,
  RepositorioCatalogosAcademicos,
} from '../../dominio/puertos/estructura-academica.puerto';

export interface EntradaActualizarGradoEducativo {
  id: string;
  nombre?: string;
  descripcion?: string | null;
  orden?: number;
  estado?: EstadoNivel;
}

export class ActualizarGradoEducativoCasoUso {
  constructor(private readonly repositorio: RepositorioCatalogosAcademicos) {}

  async ejecutar(
    entrada: EntradaActualizarGradoEducativo,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const grado = await this.repositorio.obtenerGradoBase(
      entrada.id,
      alcance.institucionId,
    );
    if (!grado) throw new GradoEducativoNoEncontradoError();

    await this.repositorio.actualizarGradoEducativo({
      id: entrada.id,
      institucionId: alcance.institucionId,
      nombre: entrada.nombre,
      descripcion: entrada.descripcion,
      orden: entrada.orden,
      estado: entrada.estado,
    });
  }
}
