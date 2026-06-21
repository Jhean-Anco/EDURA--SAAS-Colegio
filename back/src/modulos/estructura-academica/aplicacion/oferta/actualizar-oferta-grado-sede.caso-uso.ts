import { OfertaGradoSedeNoEncontradaError } from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoOferta,
  RepositorioOfertaAcademica,
} from '../../dominio/puertos/estructura-academica.puerto';

export interface EntradaActualizarOfertaGradoSede {
  id: string;
  capacidadReferencial?: number | null;
  estado?: EstadoOferta;
}

export class ActualizarOfertaGradoSedeCasoUso {
  constructor(private readonly repositorio: RepositorioOfertaAcademica) {}

  async ejecutar(
    entrada: EntradaActualizarOfertaGradoSede,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const oferta = await this.repositorio.obtenerOfertaBase(
      entrada.id,
      alcance.institucionId,
    );
    if (!oferta) throw new OfertaGradoSedeNoEncontradaError();

    if (
      alcance.ambito === 'SEDE' &&
      alcance.sedeId &&
      oferta.idSede !== alcance.sedeId
    ) {
      throw new OfertaGradoSedeNoEncontradaError();
    }

    await this.repositorio.actualizarOferta({
      id: entrada.id,
      institucionId: alcance.institucionId,
      capacidadReferencial: entrada.capacidadReferencial,
      estado: entrada.estado,
    });
  }
}
