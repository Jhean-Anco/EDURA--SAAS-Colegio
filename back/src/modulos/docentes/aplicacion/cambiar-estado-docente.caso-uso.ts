import {
  AlcanceAcceso,
  RepositorioDocentes,
} from '../dominio/puertos/docentes.puerto';
import {
  DocenteNoEncontradoError,
  TransicionEstadoDocenteInvalidaError,
} from '../dominio/errores-docentes';

const TRANSICIONES: Record<string, string[]> = {
  ACTIVO: ['INACTIVO', 'CESADO'],
  INACTIVO: ['ACTIVO', 'CESADO'],
  CESADO: [],
};

export class CambiarEstadoDocenteCasoUso {
  constructor(private readonly repositorio: RepositorioDocentes) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    id: string;
    estado: string;
    fechaCese?: string | null;
  }): Promise<void> {
    const { alcance } = entrada;

    const docente = await this.repositorio.obtenerDocenteBase(
      entrada.id,
      alcance,
    );
    if (!docente) throw new DocenteNoEncontradoError();

    const permitidos = TRANSICIONES[docente.estado] ?? [];
    if (!permitidos.includes(entrada.estado)) {
      throw new TransicionEstadoDocenteInvalidaError(
        `No se puede pasar de ${docente.estado} a ${entrada.estado}`,
      );
    }

    if (entrada.estado === 'CESADO') {
      await this.repositorio.inactivarAsignacionesDocente(
        entrada.id,
        alcance.institucionId,
      );
    }

    await this.repositorio.cambiarEstadoDocente(
      entrada.id,
      alcance.institucionId,
      entrada.estado,
      entrada.estado === 'CESADO' ? (entrada.fechaCese ?? null) : null,
    );
  }
}
