import {
  CapacidadSuperaAforoError,
  EspacioFisicoFueraDeSedeError,
  EspacioInactivoError,
  EspacioNoEsAulaError,
  SeccionAcademicaNoEncontradaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  RepositorioOfertaAcademica,
} from '../../dominio/puertos/estructura-academica.puerto';

export class AsignarEspacioSeccionCasoUso {
  constructor(private readonly repositorio: RepositorioOfertaAcademica) {}

  async ejecutar(
    idSeccion: string,
    idEspacioFisico: string | null,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const seccion = await this.repositorio.obtenerSeccionBase(
      idSeccion,
      alcance.institucionId,
    );
    if (!seccion) throw new SeccionAcademicaNoEncontradaError();

    if (
      alcance.ambito === 'SEDE' &&
      alcance.sedeId &&
      seccion.idSede !== alcance.sedeId
    ) {
      throw new SeccionAcademicaNoEncontradaError();
    }

    if (idEspacioFisico) {
      const espacio = await this.repositorio.verificarEspacioFisicoEnSede(
        idEspacioFisico,
        seccion.idSede,
      );
      if (!espacio) throw new EspacioFisicoFueraDeSedeError();
      if (!espacio.esAula) throw new EspacioNoEsAulaError();
      if (!espacio.estaActivo) throw new EspacioInactivoError();
      if (
        seccion.capacidadMaxima &&
        espacio.aforo !== null &&
        seccion.capacidadMaxima > espacio.aforo
      ) {
        throw new CapacidadSuperaAforoError();
      }
    }

    await this.repositorio.actualizarSeccion({
      id: idSeccion,
      institucionId: alcance.institucionId,
      idEspacioFisico: idEspacioFisico,
    });
  }
}
