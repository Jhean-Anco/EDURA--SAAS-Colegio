import {
  ApoderadoPrincipalExistenteError,
  EstudianteNoEncontradoError,
  PersonaFueraDeInstitucionError,
} from '../dominio/errores-estudiantes';
import { RepositorioEstudiantes } from '../dominio/puertos/estudiantes.puerto';

export class AgregarApoderadoEstudianteCasoUso {
  constructor(private readonly repositorio: RepositorioEstudiantes) {}

  async ejecutar(entrada: {
    institucionId: string;
    estudianteId: string;
    idPersona: string;
    parentesco: string;
    esPrincipal?: boolean;
    puedeRecoger?: boolean;
    recibeComunicaciones?: boolean;
  }): Promise<{ id: string }> {
    const existe = await this.repositorio.estudianteExiste(
      entrada.estudianteId,
      entrada.institucionId,
    );
    if (!existe) throw new EstudianteNoEncontradoError();

    const personaOk = await this.repositorio.verificarPersonaDeInstitucion(
      entrada.idPersona,
      entrada.institucionId,
    );
    if (!personaOk) throw new PersonaFueraDeInstitucionError();

    if (entrada.esPrincipal) {
      const hayPrincipal = await this.repositorio.apoderadoPrincipalActivo(
        entrada.estudianteId,
        entrada.institucionId,
      );
      if (hayPrincipal) throw new ApoderadoPrincipalExistenteError();
    }

    return this.repositorio.crearApoderado(entrada);
  }
}
