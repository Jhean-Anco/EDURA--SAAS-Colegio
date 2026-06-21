import { AlcanceAcceso } from '../../dominio/matriculas/matricula';
import { MatriculasPuerto } from '../../dominio/puertos/matriculas.puerto';
import {
  MatriculaNoEncontradaError,
  EstudianteFueraDeInstitucionError,
  EstudianteEstadoInvalidoError,
  AnioAcademicoNoVigenteError,
  EstructuraAcademicaIncoherenteError,
  OfertaGradoSedeInactivaError,
  SeccionInactivaError,
  SeccionNoCorrespondeAOfertaError,
  OperacionSobreSedeNoPermitidaError,
} from '../../dominio/errores-matriculas';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio';

export interface EntradaActualizarMatriculaBorrador {
  idSede?: string;
  idEstudiante?: string;
  idAnioAcademico?: string;
  idNivelEducativo?: string;
  idGradoEducativo?: string;
  idOfertaGradoSede?: string;
  idSeccionAcademica?: string | null;
  codigoMatricula?: string;
  fechaMatricula?: Date;
  observacion?: string | null;
}

export class ActualizarMatriculaBorradorCasoUso {
  constructor(private readonly repositorio: MatriculasPuerto) {}

  async ejecutar(
    id: string,
    entrada: EntradaActualizarMatriculaBorrador,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    const matricula = await this.repositorio.buscarPorId(id, alcance);
    if (!matricula) {
      throw new MatriculaNoEncontradaError();
    }

    // 1. Validadion de ambitos
    if (
      alcance.ambito === 'SEDE' &&
      entrada.idSede &&
      entrada.idSede !== alcance.sedeId
    ) {
      throw new OperacionSobreSedeNoPermitidaError();
    }

    const nuevaSede = entrada.idSede ?? matricula.idSede;
    const nuevoEstudiante = entrada.idEstudiante ?? matricula.idEstudiante;
    const nuevoAnio = entrada.idAnioAcademico ?? matricula.idAnioAcademico;
    const nuevoNivel = entrada.idNivelEducativo ?? matricula.idNivelEducativo;
    const nuevoGrado = entrada.idGradoEducativo ?? matricula.idGradoEducativo;
    const nuevaOferta =
      entrada.idOfertaGradoSede ?? matricula.idOfertaGradoSede;

    // 2. Si cambia de estudiante:
    if (entrada.idEstudiante) {
      const estudiante = await this.repositorio.verificarEstudiante(
        nuevoEstudiante,
        alcance.institucionId,
      );
      if (!estudiante) {
        throw new EstudianteFueraDeInstitucionError();
      }
      if (estudiante.estado !== 'ACTIVO') {
        throw new EstudianteEstadoInvalidoError();
      }
    }

    // 3. Si cambia de año:
    if (entrada.idAnioAcademico) {
      const anio = await this.repositorio.verificarAnioAcademico(
        nuevoAnio,
        alcance.institucionId,
      );
      if (!anio) {
        throw new EstructuraAcademicaIncoherenteError();
      }
      if (anio.estado === 'CERRADO' || anio.estado === 'ANULADO') {
        throw new AnioAcademicoNoVigenteError();
      }
    }

    // 4. Si cambia oferta o grado/anio/sede:
    if (
      entrada.idOfertaGradoSede ||
      entrada.idSede ||
      entrada.idAnioAcademico ||
      entrada.idGradoEducativo
    ) {
      const oferta = await this.repositorio.verificarOfertaGradoSede(
        nuevaOferta,
        alcance.institucionId,
      );
      if (!oferta) {
        throw new EstructuraAcademicaIncoherenteError();
      }
      if (
        oferta.idSede !== nuevaSede ||
        oferta.idAnioAcademico !== nuevoAnio ||
        oferta.idGradoEducativo !== nuevoGrado
      ) {
        throw new EstructuraAcademicaIncoherenteError();
      }
      if (oferta.estado !== 'ACTIVA') {
        throw new OfertaGradoSedeInactivaError();
      }
    }

    // Nivel
    if (entrada.idGradoEducativo || entrada.idNivelEducativo) {
      const grado = await this.repositorio.verificarGrado(
        nuevoGrado,
        alcance.institucionId,
      );
      if (!grado || grado.idNivelEducativo !== nuevoNivel) {
        throw new EstructuraAcademicaIncoherenteError();
      }
    }

    // Seccion
    if (entrada.idSeccionAcademica) {
      const seccion = await this.repositorio.verificarSeccion(
        entrada.idSeccionAcademica,
        alcance.institucionId,
      );
      if (!seccion) {
        throw new EstructuraAcademicaIncoherenteError();
      }
      if (seccion.estado !== 'ACTIVA') {
        throw new SeccionInactivaError();
      }
      if (seccion.idOfertaGradoSede !== nuevaOferta) {
        throw new SeccionNoCorrespondeAOfertaError();
      }
    }

    // Codigo
    if (entrada.codigoMatricula) {
      const codigoNorm = entrada.codigoMatricula.trim().toUpperCase();
      if (
        await this.repositorio.existeCodigoMatricula(
          codigoNorm,
          alcance.institucionId,
          id,
        )
      ) {
        throw new ErrorDominio(
          'CODIGO_DUPLICADO',
          'El codigo de matricula ya existe en la institucion.',
        );
      }
    }

    // 5. Aplicar cambios a traves del agregado
    matricula.actualizarDatosBorrador({
      idSede: entrada.idSede,
      idEstudiante: entrada.idEstudiante,
      idAnioAcademico: entrada.idAnioAcademico,
      idNivelEducativo: entrada.idNivelEducativo,
      idGradoEducativo: entrada.idGradoEducativo,
      idOfertaGradoSede: entrada.idOfertaGradoSede,
      idSeccionAcademica: entrada.idSeccionAcademica,
      codigoMatricula: entrada.codigoMatricula
        ? entrada.codigoMatricula.trim().toUpperCase()
        : undefined,
      fechaMatricula: entrada.fechaMatricula,
      observacion: entrada.observacion,
    });

    await this.repositorio.guardar(matricula);

    return { id };
  }
}
