import {
  PlanEstudioNoEncontradoError,
  PlanNoModificableError,
  DetalleAsignaturaDuplicadaError,
  DetalleOrdenDuplicadoError,
  DetalleHorasInvalidasError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  RepositorioPlanesEstudio,
  TipoDetalle,
} from '../../dominio/puertos/curriculo.puerto';

export interface EntradaAgregarDetallePlanEstudio {
  idPlanEstudio: string;
  idAsignatura: string;
  tipo: TipoDetalle;
  horasSemanales: number;
  horasAnuales: number;
  orden: number;
  observacion?: string | null;
}

export class AgregarDetallePlanEstudioCasoUso {
  constructor(private readonly repositorio: RepositorioPlanesEstudio) {}

  async ejecutar(
    entrada: EntradaAgregarDetallePlanEstudio,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    if (alcance.ambito !== 'INSTITUCION') throw new AmbiteInstitucionRequeridoError();

    const plan = await this.repositorio.obtenerPlanBase(entrada.idPlanEstudio, alcance.institucionId);
    if (!plan) throw new PlanEstudioNoEncontradoError();

    // RN-CUR-008
    if (plan.estado !== 'BORRADOR') throw new PlanNoModificableError();

    if (entrada.horasSemanales <= 0 || entrada.horasAnuales <= 0) {
      throw new DetalleHorasInvalidasError();
    }

    if (await this.repositorio.existeAsignaturaEnPlan(entrada.idAsignatura, entrada.idPlanEstudio)) {
      throw new DetalleAsignaturaDuplicadaError();
    }
    if (await this.repositorio.existeOrdenDetalleEnPlan(entrada.orden, entrada.idPlanEstudio)) {
      throw new DetalleOrdenDuplicadoError();
    }

    return this.repositorio.agregarDetalle({
      institucionId: alcance.institucionId,
      idPlanEstudio: entrada.idPlanEstudio,
      idAsignatura: entrada.idAsignatura,
      tipo: entrada.tipo,
      horasSemanales: entrada.horasSemanales,
      horasAnuales: entrada.horasAnuales,
      orden: entrada.orden,
      observacion: entrada.observacion ?? null,
    });
  }
}
