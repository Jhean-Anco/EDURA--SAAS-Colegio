import {
  AlcanceAcceso,
  RepositorioDocentes,
} from '../dominio/puertos/docentes.puerto';
import {
  CodigoDocenteDuplicadoError,
  PersonaFueraDeInstitucionDocenteError,
  PersonaYaEsDocenteError,
  SedeFueraDeInstitucionDocenteError,
} from '../dominio/errores-docentes';

export class CrearDocenteCasoUso {
  constructor(private readonly repositorio: RepositorioDocentes) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    idPersona: string;
    idSede: string;
    codigo: string;
    fechaIngreso?: string | null;
    perfilProfesional?: string | null;
    observacion?: string | null;
  }): Promise<{ id: string }> {
    const { alcance } = entrada;

    const idSede =
      alcance.ambito === 'SEDE' && alcance.sedeId
        ? alcance.sedeId
        : entrada.idSede;

    const personaOk = await this.repositorio.verificarPersonaEnInstitucion(
      entrada.idPersona,
      alcance.institucionId,
    );
    if (!personaOk) throw new PersonaFueraDeInstitucionDocenteError();

    const sedeOk = await this.repositorio.verificarSedeEnInstitucion(
      idSede,
      alcance.institucionId,
    );
    if (!sedeOk) throw new SedeFueraDeInstitucionDocenteError();

    const codigoNormalizado = entrada.codigo.trim().toUpperCase();

    if (
      await this.repositorio.existeCodigoNormalizado(
        codigoNormalizado,
        alcance.institucionId,
      )
    ) {
      throw new CodigoDocenteDuplicadoError();
    }

    if (
      await this.repositorio.personaYaEsDocente(
        entrada.idPersona,
        alcance.institucionId,
      )
    ) {
      throw new PersonaYaEsDocenteError();
    }

    return this.repositorio.crearDocente({
      institucionId: alcance.institucionId,
      idPersona: entrada.idPersona,
      codigo: entrada.codigo.trim(),
      codigoNormalizado,
      fechaIngreso: entrada.fechaIngreso ?? null,
      perfilProfesional: entrada.perfilProfesional ?? null,
      observacion: entrada.observacion ?? null,
      idSede,
    } as Parameters<RepositorioDocentes['crearDocente']>[0]);
  }
}
