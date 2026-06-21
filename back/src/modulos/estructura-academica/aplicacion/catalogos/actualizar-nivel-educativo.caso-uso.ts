import { NivelEducativoNoEncontradoError } from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoNivel,
  RepositorioCatalogosAcademicos,
} from '../../dominio/puertos/estructura-academica.puerto';

export interface EntradaActualizarNivelEducativo {
  id: string;
  nombre?: string;
  descripcion?: string | null;
  orden?: number;
  estado?: EstadoNivel;
}

export class ActualizarNivelEducativoCasoUso {
  constructor(private readonly repositorio: RepositorioCatalogosAcademicos) {}

  async ejecutar(
    entrada: EntradaActualizarNivelEducativo,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const nivel = await this.repositorio.obtenerNivelBase(
      entrada.id,
      alcance.institucionId,
    );
    if (!nivel) throw new NivelEducativoNoEncontradoError();

    await this.repositorio.actualizarNivelEducativo({
      id: entrada.id,
      institucionId: alcance.institucionId,
      nombre: entrada.nombre,
      descripcion: entrada.descripcion,
      orden: entrada.orden,
      estado: entrada.estado,
    });
  }
}
