import {
  AlcanceAcceso,
  RepositorioDocentes,
  RepositorioEspecialidadesProfesionales,
} from '../dominio/puertos/docentes.puerto';
import {
  AsignacionDocenteSedNoEncontradaError,
  DocenteNoEncontradoError,
} from '../dominio/errores-docentes';

export class ActualizarEspecialidadDocenteCasoUso {
  constructor(
    private readonly repositorioDocentes: RepositorioDocentes,
    private readonly repositorioEspecialidades: RepositorioEspecialidadesProfesionales,
  ) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    idDocente: string;
    idAsignacion: string;
    aniosExperiencia?: number | null;
    estado?: string;
  }): Promise<void> {
    const { alcance } = entrada;

    const docente = await this.repositorioDocentes.obtenerDocenteBase(
      entrada.idDocente,
      alcance,
    );
    if (!docente) throw new DocenteNoEncontradoError();

    const asignacion =
      await this.repositorioEspecialidades.obtenerAsignacionEspecialidadBase(
        entrada.idAsignacion,
        entrada.idDocente,
        alcance.institucionId,
      );
    if (!asignacion) throw new AsignacionDocenteSedNoEncontradaError();

    await this.repositorioEspecialidades.actualizarAsignacionEspecialidad({
      idAsignacion: entrada.idAsignacion,
      idDocente: entrada.idDocente,
      institucionId: alcance.institucionId,
      ...(entrada.aniosExperiencia !== undefined && {
        aniosExperiencia: entrada.aniosExperiencia,
      }),
      ...(entrada.estado !== undefined && { estado: entrada.estado }),
    });
  }
}
