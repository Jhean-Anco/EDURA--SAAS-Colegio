import {
  PlanEstudioNoEncontradoError,
  PlanCodigoDuplicadoError,
  PlanNoModificableError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  RepositorioPlanesEstudio,
} from '../../dominio/puertos/curriculo.puerto';

export interface EntradaActualizarPlanEstudio {
  id: string;
  codigo?: string;
  nombre?: string;
  observacion?: string | null;
}

export class ActualizarPlanEstudioCasoUso {
  constructor(private readonly repositorio: RepositorioPlanesEstudio) {}

  async ejecutar(
    entrada: EntradaActualizarPlanEstudio,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    const plan = await this.repositorio.obtenerPlanBase(
      entrada.id,
      alcance.institucionId,
    );
    if (!plan) throw new PlanEstudioNoEncontradoError();

    // RN-CUR-008: solo modificable en BORRADOR
    if (plan.estado !== 'BORRADOR') throw new PlanNoModificableError();

    const codigoNorm = entrada.codigo
      ? entrada.codigo.trim().toUpperCase()
      : undefined;

    if (codigoNorm) {
      if (
        await this.repositorio.existeCodigoPlanEnInstitucion(
          codigoNorm,
          alcance.institucionId,
          entrada.id,
        )
      ) {
        throw new PlanCodigoDuplicadoError();
      }
    }

    await this.repositorio.actualizarPlan({
      id: entrada.id,
      institucionId: alcance.institucionId,
      codigo: entrada.codigo ? entrada.codigo.trim() : undefined,
      codigoNormalizado: codigoNorm,
      nombre: entrada.nombre ? entrada.nombre.trim() : undefined,
      observacion: entrada.observacion,
    });
  }
}
