import {
  AlcanceAcceso,
  RepositorioDocentes,
} from '../dominio/puertos/docentes.puerto';
import {
  AsignacionDocenteSedNoEncontradaError,
  DocenteNoEncontradoError,
} from '../dominio/errores-docentes';

export class EstablecerSedePrincipalDocenteCasoUso {
  constructor(private readonly repositorio: RepositorioDocentes) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    idDocente: string;
    idAsignacion: string;
  }): Promise<void> {
    const { alcance } = entrada;

    const docente = await this.repositorio.obtenerDocenteBase(
      entrada.idDocente,
      alcance,
    );
    if (!docente) throw new DocenteNoEncontradoError();

    const asignacion = await this.repositorio.obtenerAsignacionSedeBase(
      entrada.idAsignacion,
      entrada.idDocente,
      alcance.institucionId,
    );
    if (!asignacion || asignacion.estado !== 'ACTIVA') {
      throw new AsignacionDocenteSedNoEncontradaError();
    }

    // Quitar principal de otras asignaciones y marcar esta como principal
    await this.repositorio.quitarPrincipalAsignacionesSede(
      entrada.idDocente,
      alcance.institucionId,
      entrada.idAsignacion,
    );

    await this.repositorio.actualizarAsignacionSede({
      idAsignacion: entrada.idAsignacion,
      idDocente: entrada.idDocente,
      institucionId: alcance.institucionId,
      esPrincipal: true,
    });
  }
}
