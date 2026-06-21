import {
  GradoCodigoDuplicadoError,
  NivelEducativoNoEncontradoError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioCatalogosAcademicos,
} from '../../dominio/puertos/estructura-academica.puerto';

export interface EntradaCrearGradoEducativo {
  idNivelEducativo: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  orden: number;
}

export class CrearGradoEducativoCasoUso {
  constructor(private readonly repositorio: RepositorioCatalogosAcademicos) {}

  async ejecutar(
    entrada: EntradaCrearGradoEducativo,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    const nivel = await this.repositorio.obtenerNivelBase(
      entrada.idNivelEducativo,
      alcance.institucionId,
    );
    if (!nivel) throw new NivelEducativoNoEncontradoError();

    const codigoNormalizado = entrada.codigo.trim().toUpperCase();
    const existeCodigo = await this.repositorio.existeCodigoGradoEnNivel(
      codigoNormalizado,
      entrada.idNivelEducativo,
      alcance.institucionId,
    );
    if (existeCodigo) throw new GradoCodigoDuplicadoError();

    const existeOrden = await this.repositorio.existeOrdenGradoEnNivel(
      entrada.orden,
      entrada.idNivelEducativo,
      alcance.institucionId,
    );
    if (existeOrden) throw new GradoCodigoDuplicadoError();

    return this.repositorio.crearGradoEducativo({
      institucionId: alcance.institucionId,
      idNivelEducativo: entrada.idNivelEducativo,
      codigo: entrada.codigo.trim(),
      codigoNormalizado,
      nombre: entrada.nombre.trim(),
      descripcion: entrada.descripcion ?? null,
      orden: entrada.orden,
    });
  }
}
