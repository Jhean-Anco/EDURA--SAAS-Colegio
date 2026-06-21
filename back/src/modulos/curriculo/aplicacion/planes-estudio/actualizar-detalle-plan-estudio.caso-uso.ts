import {
  PlanEstudioNoEncontradoError,
  PlanNoModificableError,
  DetalleNoEncontradoError,
  DetalleOrdenDuplicadoError,
  DetalleHorasInvalidasError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  RepositorioPlanesEstudio,
  TipoDetalle,
} from '../../dominio/puertos/curriculo.puerto';

export interface EntradaActualizarDetallePlanEstudio {
  id: string;
  idPlanEstudio: string;
  tipo?: TipoDetalle;
  horasSemanales?: number;
  horasAnuales?: number;
  orden?: number;
  observacion?: string | null;
}

export class ActualizarDetallePlanEstudioCasoUso {
  constructor(private readonly repositorio: RepositorioPlanesEstudio) { }

  async ejecutar(
    entrada: EntradaActualizarDetallePlanEstudio,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    if (alcance.ambito !== 'INSTITUCION') throw new AmbiteInstitucionRequeridoError();

    const plan = await this.repositorio.obtenerPlanBase(entrada.idPlanEstudio, alcance.institucionId);
    if (!plan) throw new PlanEstudioNoEncontradoError();
    if (plan.estado !== 'BORRADOR') throw new PlanNoModificableError();

    const detalle = await this.repositorio.obtenerDetalleBase(entrada.id, entrada.idPlanEstudio, alcance.institucionId);
    if (!detalle) throw new DetalleNoEncontradoError();

    if (entrada.horasSemanales !== undefined && entrada.horasSemanales <= 0) {
      throw new DetalleHorasInvalidasError();
    }
    if (entrada.horasAnuales !== undefined && entrada.horasAnuales <= 0) {
      throw new DetalleHorasInvalidasError();
    }

    if (entrada.orden !== undefined) {
      if (await this.repositorio.existeOrdenDetalleEnPlan(entrada.orden, entrada.idPlanEstudio, entrada.id)) {
        throw new DetalleOrdenDuplicadoError();
      }
    }

    await this.repositorio.actualizarDetalle({
      id: entrada.id,
      institucionId: alcance.institucionId,
      tipo: entrada.tipo,
      horasSemanales: entrada.horasSemanales,
      horasAnuales: entrada.horasAnuales,
      orden: entrada.orden,
      observacion: entrada.observacion,
    });
  }
}
