import {
  AlcanceAcceso,
  RepositorioDocentes,
} from '../dominio/puertos/docentes.puerto';
import {
  AsignacionDocenteSedNoEncontradaError,
  DocenteNoEncontradoError,
  UltimaSedeActivaError,
} from '../dominio/errores-docentes';

export class ActualizarAsignacionDocenteSedeCasoUso {
  constructor(private readonly repositorio: RepositorioDocentes) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    idDocente: string;
    idAsignacion: string;
    fechaFin?: string | null;
    estado?: string;
    observacion?: string | null;
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
    if (!asignacion) throw new AsignacionDocenteSedNoEncontradaError();

    // Si se inactiva la asignación, verificar que no sea la última sede activa de un docente ACTIVO
    if (entrada.estado === 'INACTIVA' && asignacion.estado === 'ACTIVA') {
      if (docente.estado === 'ACTIVO') {
        const totalActivas = await this.repositorio.contarSedesActivas(
          entrada.idDocente,
          alcance.institucionId,
        );
        if (totalActivas <= 1) throw new UltimaSedeActivaError();
      }
    }

    await this.repositorio.actualizarAsignacionSede({
      idAsignacion: entrada.idAsignacion,
      idDocente: entrada.idDocente,
      institucionId: alcance.institucionId,
      ...(entrada.fechaFin !== undefined && { fechaFin: entrada.fechaFin }),
      ...(entrada.estado !== undefined && { estado: entrada.estado }),
      ...(entrada.observacion !== undefined && {
        observacion: entrada.observacion,
      }),
    });
  }
}
