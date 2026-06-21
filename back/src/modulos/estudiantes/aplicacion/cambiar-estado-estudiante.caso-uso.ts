import { EstudianteNoEncontradoError } from '../dominio/errores-estudiantes';
import { RepositorioEstudiantes } from '../dominio/puertos/estudiantes.puerto';

export class CambiarEstadoEstudianteCasoUso {
  constructor(private readonly repositorio: RepositorioEstudiantes) {}

  async ejecutar(entrada: {
    institucionId: string;
    id: string;
    estado: string;
  }): Promise<void> {
    const base = await this.repositorio.obtenerEstudianteBase(
      entrada.id,
      entrada.institucionId,
    );
    if (!base) throw new EstudianteNoEncontradoError();
    const actualizado = await this.repositorio.cambiarEstadoEstudiante(
      entrada.id,
      entrada.institucionId,
      entrada.estado,
    );
    if (!actualizado) throw new EstudianteNoEncontradoError();
  }
}
