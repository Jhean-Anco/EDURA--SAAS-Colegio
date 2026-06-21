import { OfertaDuplicadaError } from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioOfertaAcademica,
} from '../../dominio/puertos/estructura-academica.puerto';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio';

export interface EntradaCrearOfertaGradoSede {
  idSede: string;
  idGradoEducativo: string;
  idAnioAcademico: string;
  capacidadReferencial?: number | null;
}

export class CrearOfertaGradoSedeCasoUso {
  constructor(private readonly repositorio: RepositorioOfertaAcademica) {}

  async ejecutar(
    entrada: EntradaCrearOfertaGradoSede,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    if (
      alcance.ambito === 'SEDE' &&
      alcance.sedeId &&
      entrada.idSede !== alcance.sedeId
    ) {
      throw new ErrorDominio(
        'CONTEXTO_NO_AUTORIZADO',
        'No autorizado para crear oferta en esta sede',
      );
    }

    const existe = await this.repositorio.existeOfertaEnSede({
      idSede: entrada.idSede,
      idGrado: entrada.idGradoEducativo,
      idAnio: entrada.idAnioAcademico,
      institucionId: alcance.institucionId,
    });
    if (existe) throw new OfertaDuplicadaError();

    return this.repositorio.crearOfertaGradoSede({
      institucionId: alcance.institucionId,
      idSede: entrada.idSede,
      idGradoEducativo: entrada.idGradoEducativo,
      idAnioAcademico: entrada.idAnioAcademico,
      capacidadReferencial: entrada.capacidadReferencial,
    });
  }
}
