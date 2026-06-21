import {
  AlcanceAcceso,
  RepositorioDocentes,
} from '../dominio/puertos/docentes.puerto';
import {
  AsignacionSedeDuplicadaError,
  DocenteNoEncontradoError,
  SedeFueraDeInstitucionDocenteError,
  SedePrincipalExistenteError,
} from '../dominio/errores-docentes';

export class AsignarDocenteSedeCasoUso {
  constructor(private readonly repositorio: RepositorioDocentes) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    idDocente: string;
    idSede: string;
    esPrincipal: boolean;
    fechaInicio: string;
    observacion?: string | null;
  }): Promise<{ id: string }> {
    const { alcance } = entrada;

    const docente = await this.repositorio.obtenerDocenteBase(
      entrada.idDocente,
      alcance,
    );
    if (!docente) throw new DocenteNoEncontradoError();

    if (alcance.ambito === 'SEDE' && entrada.idSede !== alcance.sedeId) {
      throw new SedeFueraDeInstitucionDocenteError();
    }

    const sedeOk = await this.repositorio.verificarSedeEnInstitucion(
      entrada.idSede,
      alcance.institucionId,
    );
    if (!sedeOk) throw new SedeFueraDeInstitucionDocenteError();

    if (
      await this.repositorio.existeAsignacionActivaEnSede(
        entrada.idDocente,
        entrada.idSede,
      )
    ) {
      throw new AsignacionSedeDuplicadaError();
    }

    if (
      entrada.esPrincipal &&
      (await this.repositorio.existeSedePrincipalActiva(entrada.idDocente))
    ) {
      throw new SedePrincipalExistenteError();
    }

    return this.repositorio.crearAsignacionSede({
      institucionId: alcance.institucionId,
      idDocente: entrada.idDocente,
      idSede: entrada.idSede,
      esPrincipal: entrada.esPrincipal,
      fechaInicio: entrada.fechaInicio,
      observacion: entrada.observacion ?? null,
    });
  }
}
