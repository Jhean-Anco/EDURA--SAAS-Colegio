import {
  PlanEstudioNoEncontradoError,
  PlanSinDetallesError,
  PlanAsignaturaInactivaError,
  TransicionPlanInvalidaError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  RepositorioPlanesEstudio,
} from '../../dominio/puertos/curriculo.puerto';

export class AprobarPlanEstudioCasoUso {
  constructor(private readonly repositorio: RepositorioPlanesEstudio) {}

  async ejecutar(id: string, alcance: AlcanceAcceso): Promise<void> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    const plan = await this.repositorio.obtenerPlanBase(
      id,
      alcance.institucionId,
    );
    if (!plan) throw new PlanEstudioNoEncontradoError();

    // Enforce that approval is only allowed from BORRADOR state
    if (plan.estado !== 'BORRADOR') {
      throw new TransicionPlanInvalidaError(plan.estado, 'APROBADO');
    }

    // RN-CUR-013: must have at least one active subject
    const totalActivos = await this.repositorio.contarDetallesActivos(
      id,
      alcance.institucionId,
    );
    if (totalActivos === 0) throw new PlanSinDetallesError();

    // All subjects must be active in the catalog
    if (
      await this.repositorio.tieneAsignaturasInactivasEnDetalle(
        id,
        alcance.institucionId,
      )
    ) {
      throw new PlanAsignaturaInactivaError();
    }

    const aprobacion = {
      fechaAprobacion: new Date().toISOString(),
      idUsuarioAprobador: alcance.usuarioId,
    };

    await this.repositorio.cambiarEstadoPlan(
      id,
      alcance.institucionId,
      'APROBADO',
      aprobacion,
    );
  }
}
