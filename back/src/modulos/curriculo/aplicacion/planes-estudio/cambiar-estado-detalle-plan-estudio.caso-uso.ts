import {
  PlanEstudioNoEncontradoError,
  PlanNoModificableError,
  DetalleNoEncontradoError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  EstadoDetalle,
  RepositorioPlanesEstudio,
} from '../../dominio/puertos/curriculo.puerto';

export class CambiarEstadoDetallePlanEstudioCasoUso {
  constructor(private readonly repositorio: RepositorioPlanesEstudio) {}

  async ejecutar(
    idDetalle: string,
    idPlan: string,
    nuevoEstado: EstadoDetalle,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    const plan = await this.repositorio.obtenerPlanBase(
      idPlan,
      alcance.institucionId,
    );
    if (!plan) throw new PlanEstudioNoEncontradoError();
    if (plan.estado !== 'BORRADOR') throw new PlanNoModificableError();

    const detalle = await this.repositorio.obtenerDetalleBase(
      idDetalle,
      idPlan,
      alcance.institucionId,
    );
    if (!detalle) throw new DetalleNoEncontradoError();

    await this.repositorio.cambiarEstadoDetalle(
      idDetalle,
      idPlan,
      alcance.institucionId,
      nuevoEstado,
    );
  }
}
