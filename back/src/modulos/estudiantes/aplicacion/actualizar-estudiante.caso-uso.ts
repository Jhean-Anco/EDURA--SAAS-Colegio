import {
  EstudianteCodigoDuplicadoError,
  EstudianteNoEncontradoError,
  SedeFueraDeInstitucionError,
} from '../dominio/errores-estudiantes';
import { RepositorioEstudiantes } from '../dominio/puertos/estudiantes.puerto';

export class ActualizarEstudianteCasoUso {
  constructor(private readonly repositorio: RepositorioEstudiantes) {}

  async ejecutar(entrada: {
    institucionId: string;
    id: string;
    codigo?: string;
    idSede?: string;
    fechaIngreso?: string | null;
    observacion?: string | null;
  }): Promise<void> {
    const base = await this.repositorio.obtenerEstudianteBase(
      entrada.id,
      entrada.institucionId,
    );
    if (!base) throw new EstudianteNoEncontradoError();
    if (entrada.idSede) {
      const sedeOk = await this.repositorio.verificarSedeDeInstitucion(
        entrada.idSede,
        entrada.institucionId,
      );
      if (!sedeOk) throw new SedeFueraDeInstitucionError();
    }
    if (
      entrada.codigo &&
      (await this.repositorio.existeCodigo(
        entrada.codigo,
        entrada.institucionId,
        entrada.id,
      ))
    ) {
      throw new EstudianteCodigoDuplicadoError();
    }
    const actualizado = await this.repositorio.actualizarEstudiante(entrada);
    if (!actualizado) throw new EstudianteNoEncontradoError();
  }
}
