import {
  PlanEstudioNoEncontradoError,
  PlanCodigoDuplicadoError,
  PlanVersionDuplicadaError,
  PlanAnioFueraDeInstitucionError,
  PlanAnioNoDisponibleError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  RepositorioPlanesEstudio,
} from '../../dominio/puertos/curriculo.puerto';

export interface EntradaDuplicarPlanEstudio {
  idPlanOrigen: string;
  idAnioAcademico?: string;
  codigo: string;
  nombre: string;
  observacion?: string | null;
}

export class DuplicarPlanEstudioCasoUso {
  constructor(private readonly repositorio: RepositorioPlanesEstudio) {}

  async ejecutar(
    entrada: EntradaDuplicarPlanEstudio,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    const planOrigen = await this.repositorio.obtenerPlanBase(
      entrada.idPlanOrigen,
      alcance.institucionId,
    );
    if (!planOrigen) throw new PlanEstudioNoEncontradoError();

    const idAnio = entrada.idAnioAcademico ?? planOrigen.idAnioAcademico;

    // Si se cambia de año, validar que exista en la institución
    if (
      entrada.idAnioAcademico &&
      entrada.idAnioAcademico !== planOrigen.idAnioAcademico
    ) {
      if (
        !(await this.repositorio.existeAnioEnInstitucion(
          entrada.idAnioAcademico,
          alcance.institucionId,
        ))
      ) {
        throw new PlanAnioFueraDeInstitucionError();
      }
      const estadoAnio = await this.repositorio.obtenerEstadoAnio(
        entrada.idAnioAcademico,
        alcance.institucionId,
      );
      if (estadoAnio === 'CERRADO' || estadoAnio === 'ANULADO') {
        throw new PlanAnioNoDisponibleError();
      }
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

    // Auto-calculate version transacted/locked on the server side
    const version = await this.repositorio.obtenerSiguienteVersionPlan(
      idAnio,
      planOrigen.idGradoEducativo,
      alcance.institucionId,
    );

    return this.repositorio.duplicarPlan({
      idPlanOrigen: entrada.idPlanOrigen,
      institucionId: alcance.institucionId,
      idAnioAcademico: idAnio,
      codigo: entrada.codigo.trim(),
      codigoNormalizado: codigoNorm,
      nombre: entrada.nombre.trim(),
      version,
      observacion: entrada.observacion ?? null,
    });
  }
}
