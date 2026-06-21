import {
  AlcanceAcceso,
  RepositorioEspecialidadesProfesionales,
} from '../dominio/puertos/docentes.puerto';
import {
  EspecialidadDuplicadaError,
  EspecialidadNoEncontradaError,
} from '../dominio/errores-docentes';

export class ActualizarEspecialidadProfesionalCasoUso {
  constructor(
    private readonly repositorio: RepositorioEspecialidadesProfesionales,
  ) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    id: string;
    codigo?: string;
    nombre?: string;
    descripcion?: string | null;
    estado?: string;
  }): Promise<void> {
    const { alcance } = entrada;

    const especialidad = await this.repositorio.obtenerEspecialidadBase(
      entrada.id,
      alcance.institucionId,
    );
    if (!especialidad) throw new EspecialidadNoEncontradaError();

    let codigoNormalizado: string | undefined;
    let nombreNormalizado: string | undefined;

    if (entrada.codigo !== undefined) {
      codigoNormalizado = entrada.codigo.trim().toUpperCase();
      if (
        await this.repositorio.existeCodigoNormalizadoEsp(
          codigoNormalizado,
          alcance.institucionId,
          entrada.id,
        )
      ) {
        throw new EspecialidadDuplicadaError();
      }
    }

    if (entrada.nombre !== undefined) {
      nombreNormalizado = entrada.nombre
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
      if (
        await this.repositorio.existeNombreNormalizadoEsp(
          nombreNormalizado,
          alcance.institucionId,
          entrada.id,
        )
      ) {
        throw new EspecialidadDuplicadaError();
      }
    }

    await this.repositorio.actualizarEspecialidad({
      id: entrada.id,
      institucionId: alcance.institucionId,
      ...(entrada.codigo !== undefined && {
        codigo: entrada.codigo.trim(),
        codigoNormalizado,
      }),
      ...(entrada.nombre !== undefined && {
        nombre: entrada.nombre.trim(),
        nombreNormalizado,
      }),
      ...(entrada.descripcion !== undefined && {
        descripcion: entrada.descripcion,
      }),
      ...(entrada.estado !== undefined && { estado: entrada.estado }),
    });
  }
}
