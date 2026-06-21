import { NivelCodigoDuplicadoError } from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioCatalogosAcademicos,
} from '../../dominio/puertos/estructura-academica.puerto';

export interface EntradaCrearNivelEducativo {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  orden: number;
}

export class CrearNivelEducativoCasoUso {
  constructor(private readonly repositorio: RepositorioCatalogosAcademicos) {}

  async ejecutar(
    entrada: EntradaCrearNivelEducativo,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    const codigoNormalizado = entrada.codigo.trim().toUpperCase();
    const existeCodigo = await this.repositorio.existeCodigoNivelEnInstitucion(
      codigoNormalizado,
      alcance.institucionId,
    );
    if (existeCodigo) throw new NivelCodigoDuplicadoError();

    const existeOrden = await this.repositorio.existeOrdenNivelEnInstitucion(
      entrada.orden,
      alcance.institucionId,
    );
    if (existeOrden) throw new NivelCodigoDuplicadoError();

    return this.repositorio.crearNivelEducativo({
      institucionId: alcance.institucionId,
      codigo: entrada.codigo.trim(),
      codigoNormalizado,
      nombre: entrada.nombre.trim(),
      descripcion: entrada.descripcion ?? null,
      orden: entrada.orden,
    });
  }
}
