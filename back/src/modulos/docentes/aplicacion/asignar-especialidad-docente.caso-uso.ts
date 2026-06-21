import {
  AlcanceAcceso,
  RepositorioDocentes,
  RepositorioEspecialidadesProfesionales,
} from '../dominio/puertos/docentes.puerto';
import {
  DocenteNoEncontradoError,
  EspecialidadDocenteDuplicadaError,
  EspecialidadNoEncontradaError,
  EspecialidadPrincipalExistenteError,
} from '../dominio/errores-docentes';

export class AsignarEspecialidadDocenteCasoUso {
  constructor(
    private readonly repositorioDocentes: RepositorioDocentes,
    private readonly repositorioEspecialidades: RepositorioEspecialidadesProfesionales,
  ) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    idDocente: string;
    idEspecialidad: string;
    esPrincipal: boolean;
    aniosExperiencia?: number | null;
  }): Promise<{ id: string }> {
    const { alcance } = entrada;

    const docente = await this.repositorioDocentes.obtenerDocenteBase(
      entrada.idDocente,
      alcance,
    );
    if (!docente) throw new DocenteNoEncontradoError();

    const especialidad = await this.repositorioEspecialidades.obtenerEspecialidadBase(
      entrada.idEspecialidad,
      alcance.institucionId,
    );
    if (!especialidad || especialidad.estado !== 'ACTIVA') {
      throw new EspecialidadNoEncontradaError();
    }

    if (
      await this.repositorioEspecialidades.docenteTieneEspecialidadActiva(
        entrada.idDocente,
        entrada.idEspecialidad,
      )
    ) {
      throw new EspecialidadDocenteDuplicadaError();
    }

    if (
      entrada.esPrincipal &&
      (await this.repositorioEspecialidades.existeEspecialidadPrincipalActiva(
        entrada.idDocente,
      ))
    ) {
      throw new EspecialidadPrincipalExistenteError();
    }

    return this.repositorioEspecialidades.crearAsignacionEspecialidad({
      institucionId: alcance.institucionId,
      idDocente: entrada.idDocente,
      idEspecialidad: entrada.idEspecialidad,
      esPrincipal: entrada.esPrincipal,
      aniosExperiencia: entrada.aniosExperiencia ?? null,
    });
  }
}
