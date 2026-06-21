import {
  EstudianteCodigoDuplicadoError,
  PersonaFueraDeInstitucionError,
  PersonaYaEsEstudianteError,
  SedeFueraDeInstitucionError,
} from '../dominio/errores-estudiantes';
import { RepositorioEstudiantes } from '../dominio/puertos/estudiantes.puerto';

export class CrearEstudianteCasoUso {
  constructor(private readonly repositorio: RepositorioEstudiantes) {}

  async ejecutar(entrada: {
    institucionId: string;
    idPersona: string;
    idSede: string;
    codigo: string;
    fechaIngreso?: string | null;
    observacion?: string | null;
  }): Promise<{ id: string }> {
    const sedeOk = await this.repositorio.verificarSedeDeInstitucion(
      entrada.idSede,
      entrada.institucionId,
    );
    if (!sedeOk) throw new SedeFueraDeInstitucionError();
    const personaOk = await this.repositorio.verificarPersonaDeInstitucion(
      entrada.idPersona,
      entrada.institucionId,
    );
    if (!personaOk) throw new PersonaFueraDeInstitucionError();
    if (
      await this.repositorio.existeCodigo(entrada.codigo, entrada.institucionId)
    ) {
      throw new EstudianteCodigoDuplicadoError();
    }
    if (
      await this.repositorio.personaYaEsEstudiante(
        entrada.idPersona,
        entrada.institucionId,
      )
    ) {
      throw new PersonaYaEsEstudianteError();
    }
    return this.repositorio.crearEstudiante(entrada);
  }
}
