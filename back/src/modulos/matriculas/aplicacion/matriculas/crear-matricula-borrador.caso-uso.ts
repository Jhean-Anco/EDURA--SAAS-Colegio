import { Matricula, AlcanceAcceso } from '../../dominio/matriculas/matricula';
import { MatriculasPuerto } from '../../dominio/puertos/matriculas.puerto';
import {
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

export interface EntradaCrearMatriculaBorrador {
  idSede: string;
  idEstudiante: string;
  idAnioAcademico: string;
  idNivelEducativo: string;
  idGradoEducativo: string;
  idOfertaGradoSede: string;
  idSeccionAcademica?: string | null;
  codigoMatricula: string;
  fechaMatricula: Date;
  observacion?: string | null;
}

export class CrearMatriculaBorradorCasoUso {
  constructor(private readonly repositorio: MatriculasPuerto) {}

  async ejecutar(
    entrada: EntradaCrearMatriculaBorrador,
    alcance: AlcanceAcceso,
    correlacionId?: string,
  ): Promise<{ id: string }> {
    // 1. Validacion de ambito SEDE
    if (alcance.ambito === 'SEDE' && alcance.sedeId !== entrada.idSede) {
      throw new OperacionSobreSedeNoPermitidaError();
    }

    // 2. RN-MAT-001: Estudiante debe existir, pertenecer a la institucion y ser ACTIVO
    const estudiante = await this.repositorio.verificarEstudiante(
      entrada.idEstudiante,
      alcance.institucionId,
    );
    if (!estudiante) {
      throw new EstudianteFueraDeInstitucionError();
    }
    if (estudiante.estado !== 'ACTIVO') {
      throw new EstudianteEstadoInvalidoError();
    }

    // 3. RN-MAT-002: Año académico debe pertenecer a la institución y no estar CERRADO/ANULADO
    const anio = await this.repositorio.verificarAnioAcademico(
      entrada.idAnioAcademico,
      alcance.institucionId,
    );
    if (!anio) {
      throw new EstructuraAcademicaIncoherenteError();
    }
    if (anio.estado === 'CERRADO' || anio.estado === 'ANULADO') {
      throw new AnioAcademicoNoVigenteError();
    }

    // 4. RN-MAT-003: Coherencia de estructura
    const oferta = await this.repositorio.verificarOfertaGradoSede(
      entrada.idOfertaGradoSede,
      alcance.institucionId,
    );
    if (!oferta) {
      throw new EstructuraAcademicaIncoherenteError();
    }
    if (
      oferta.idSede !== entrada.idSede ||
      oferta.idAnioAcademico !== entrada.idAnioAcademico ||
      oferta.idGradoEducativo !== entrada.idGradoEducativo
    ) {
      throw new EstructuraAcademicaIncoherenteError();
    }

    const grado = await this.repositorio.verificarGrado(
      entrada.idGradoEducativo,
      alcance.institucionId,
    );
    if (!grado || grado.idNivelEducativo !== entrada.idNivelEducativo) {
      throw new EstructuraAcademicaIncoherenteError();
    }

    // 5. RN-MAT-004: Oferta debe estar activa (estado 'ACTIVA')
    if (oferta.estado !== 'ACTIVA') {
      throw new OfertaGradoSedeInactivaError();
    }

    // 6. RN-MAT-005: Seccion activa y correspondiente a la oferta
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
      if (seccion.idOfertaGradoSede !== entrada.idOfertaGradoSede) {
        throw new SeccionNoCorrespondeAOfertaError();
      }
    }

    // 7. Validar duplicidad de codigo de matricula
    const codigoNorm = entrada.codigoMatricula.trim().toUpperCase();
    if (
      await this.repositorio.existeCodigoMatricula(
        codigoNorm,
        alcance.institucionId,
      )
    ) {
      throw new ErrorDominio(
        'CODIGO_DUPLICADO',
        'El codigo de matricula ya existe en la institucion.',
      );
    }

    // 8. Crear y guardar agregado de matricula
    const id = crypto.randomUUID();
    const matricula = new Matricula(
      id,
      alcance.institucionId,
      entrada.idSede,
      entrada.idEstudiante,
      entrada.idAnioAcademico,
      entrada.idNivelEducativo,
      entrada.idGradoEducativo,
      entrada.idOfertaGradoSede,
      entrada.idSeccionAcademica ?? null,
      codigoNorm,
      entrada.fechaMatricula,
      'BORRADOR',
      entrada.observacion ?? null,
      alcance.usuarioId,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      new Date(),
      new Date(),
    );

    await this.repositorio.ejecutarTransaccion(async (manager) => {
      await this.repositorio.guardar(matricula, manager);
      await this.repositorio.registrarHistorialEstado(
        {
          idMatricula: id,
          estadoAnterior: null,
          estadoNuevo: 'BORRADOR',
          motivo: 'Creacion de matricula en borrador',
          idUsuario: alcance.usuarioId,
          fecha: new Date(),
          correlacionId,
        },
        manager,
      );
    });

    return { id };
  }
}
