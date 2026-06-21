import {
  PlanCodigoDuplicadoError,
  PlanVersionDuplicadaError,
  PlanAnioFueraDeInstitucionError,
  PlanGradoFueraDeInstitucionError,
  PlanAnioNoDisponibleError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  RepositorioPlanesEstudio,
} from '../../dominio/puertos/curriculo.puerto';

export interface EntradaCrearPlanEstudio {
  idAnioAcademico: string;
  idGradoEducativo: string;
  codigo: string;
  nombre: string;
  observacion?: string | null;
}

export class CrearPlanEstudioCasoUso {
  constructor(private readonly repositorio: RepositorioPlanesEstudio) {}

  async ejecutar(
    entrada: EntradaCrearPlanEstudio,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    // RN-CUR-006: año y grado pertenecen a la institución
    if (
      !(await this.repositorio.existeAnioEnInstitucion(
        entrada.idAnioAcademico,
        alcance.institucionId,
      ))
    ) {
      throw new PlanAnioFueraDeInstitucionError();
    }
    if (
      !(await this.repositorio.existeGradoEnInstitucion(
        entrada.idGradoEducativo,
        alcance.institucionId,
      ))
    ) {
      throw new PlanGradoFueraDeInstitucionError();
    }

    // RN-CUR-007: año no cerrado ni anulado
    const estadoAnio = await this.repositorio.obtenerEstadoAnio(
      entrada.idAnioAcademico,
      alcance.institucionId,
    );
    if (estadoAnio === 'CERRADO' || estadoAnio === 'ANULADO') {
      throw new PlanAnioNoDisponibleError();
    }

    const codigoNorm = entrada.codigo.trim().toUpperCase();

    if (
      await this.repositorio.existeCodigoPlanEnInstitucion(
        codigoNorm,
        alcance.institucionId,
      )
    ) {
      throw new PlanCodigoDuplicadoError();
    }

    // Calculate version transacted/locked on the server side
    const version = await this.repositorio.obtenerSiguienteVersionPlan(
      entrada.idAnioAcademico,
      entrada.idGradoEducativo,
      alcance.institucionId,
    );

    return this.repositorio.crearPlan({
      institucionId: alcance.institucionId,
      idAnioAcademico: entrada.idAnioAcademico,
      idGradoEducativo: entrada.idGradoEducativo,
      codigo: entrada.codigo.trim(),
      codigoNormalizado: codigoNorm,
      nombre: entrada.nombre.trim(),
      version,
      observacion: entrada.observacion ?? null,
    });
  }
}
