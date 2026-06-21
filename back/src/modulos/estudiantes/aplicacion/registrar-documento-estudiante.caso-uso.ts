import { EstudianteNoEncontradoError } from '../dominio/errores-estudiantes';
import { RepositorioEstudiantes } from '../dominio/puertos/estudiantes.puerto';

export class RegistrarDocumentoEstudianteCasoUso {
  constructor(private readonly repositorio: RepositorioEstudiantes) {}

  async ejecutar(entrada: {
    institucionId: string;
    estudianteId: string;
    tipoDocumento: string;
    nombre: string;
    fechaEmision?: string | null;
    fechaVencimiento?: string | null;
    observacion?: string | null;
  }): Promise<void> {
    const existe = await this.repositorio.estudianteExiste(
      entrada.estudianteId,
      entrada.institucionId,
    );
    if (!existe) throw new EstudianteNoEncontradoError();

    await this.repositorio.registrarDocumento(entrada);
  }
}
