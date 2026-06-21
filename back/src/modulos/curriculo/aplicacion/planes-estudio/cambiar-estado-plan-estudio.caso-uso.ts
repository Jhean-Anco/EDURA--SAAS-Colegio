import {
  PlanEstudioNoEncontradoError,
  PlanSinDetallesError,
  PlanAsignaturaInactivaError,
  PlanVigenteYaExisteError,
  PlanAnioNoDisponibleError,
  TransicionPlanInvalidaError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  EstadoPlan,
  RepositorioPlanesEstudio,
} from '../../dominio/puertos/curriculo.puerto';

const TRANSICIONES_PLAN: Record<EstadoPlan, EstadoPlan[]> = {
  BORRADOR: ['APROBADO', 'ANULADO'],
  APROBADO: ['VIGENTE', 'ANULADO'],
  VIGENTE: ['CERRADO'],
  CERRADO: [],
  ANULADO: [],
};

export class CambiarEstadoPlanEstudioCasoUso {
  constructor(private readonly repositorio: RepositorioPlanesEstudio) {}

  async ejecutar(
    id: string,
    nuevoEstado: EstadoPlan,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    if (alcance.ambito !== 'INSTITUCION') throw new AmbiteInstitucionRequeridoError();

    const plan = await this.repositorio.obtenerPlanBase(id, alcance.institucionId);
    if (!plan) throw new PlanEstudioNoEncontradoError();

    // RN-CUR-011: validar transición
    const permitidos = TRANSICIONES_PLAN[plan.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new TransicionPlanInvalidaError(plan.estado, nuevoEstado);
    }

    // RN-CUR-013: pre-aprobación
    if (nuevoEstado === 'APROBADO') {
      const totalActivos = await this.repositorio.contarDetallesActivos(id, alcance.institucionId);
      if (totalActivos === 0) throw new PlanSinDetallesError();

      if (await this.repositorio.tieneAsignaturasInactivasEnDetalle(id, alcance.institucionId)) {
        throw new PlanAsignaturaInactivaError();
      }
    }

    // RN-CUR-014: pre-vigencia
    if (nuevoEstado === 'VIGENTE') {
      const estadoAnio = await this.repositorio.obtenerEstadoAnio(plan.idAnioAcademico, alcance.institucionId);
      if (estadoAnio === 'CERRADO' || estadoAnio === 'ANULADO') {
        throw new PlanAnioNoDisponibleError();
      }

      // RN-CUR-012: solo un plan vigente por institución, año y grado
      if (await this.repositorio.existePlanVigenteParaAnioGrado(
        plan.idAnioAcademico, plan.idGradoEducativo, alcance.institucionId, id,
      )) {
        throw new PlanVigenteYaExisteError();
      }
    }

    // Datos de aprobación para VIGENTE
    const aprobacion = nuevoEstado === 'VIGENTE'
      ? { fechaAprobacion: new Date().toISOString(), idUsuarioAprobador: alcance.usuarioId }
      : undefined;

    await this.repositorio.cambiarEstadoPlan(id, alcance.institucionId, nuevoEstado, aprobacion);
  }
}
