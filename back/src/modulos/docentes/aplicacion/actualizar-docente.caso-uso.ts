import {
  AlcanceAcceso,
  RepositorioDocentes,
} from '../dominio/puertos/docentes.puerto';
import {
  CodigoDocenteDuplicadoError,
  DocenteNoEncontradoError,
} from '../dominio/errores-docentes';

export class ActualizarDocenteCasoUso {
  constructor(private readonly repositorio: RepositorioDocentes) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    id: string;
    codigo?: string;
    fechaIngreso?: string | null;
    perfilProfesional?: string | null;
    observacion?: string | null;
  }): Promise<void> {
    const { alcance } = entrada;

    const docente = await this.repositorio.obtenerDocenteBase(
      entrada.id,
      alcance,
    );
    if (!docente) throw new DocenteNoEncontradoError();

    let codigo: string | undefined;
    let codigoNormalizado: string | undefined;

    if (entrada.codigo !== undefined) {
      codigo = entrada.codigo.trim();
      codigoNormalizado = codigo.toUpperCase();

      if (
        await this.repositorio.existeCodigoNormalizado(
          codigoNormalizado,
          alcance.institucionId,
          entrada.id,
        )
      ) {
        throw new CodigoDocenteDuplicadoError();
      }
    }

    await this.repositorio.actualizarDocente({
      id: entrada.id,
      institucionId: alcance.institucionId,
      ...(codigo !== undefined && { codigo, codigoNormalizado }),
      ...(entrada.fechaIngreso !== undefined && {
        fechaIngreso: entrada.fechaIngreso,
      }),
      ...(entrada.perfilProfesional !== undefined && {
        perfilProfesional: entrada.perfilProfesional,
      }),
      ...(entrada.observacion !== undefined && {
        observacion: entrada.observacion,
      }),
    });
  }
}
