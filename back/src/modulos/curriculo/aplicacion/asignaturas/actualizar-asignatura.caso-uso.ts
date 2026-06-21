import {
  AsignaturaNoEncontradaError,
  AsignaturaCodigoDuplicadoError,
  AsignaturaOrdenDuplicadoError,
  AsignaturaAreaFueraDeInstitucionError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  RepositorioAsignaturas,
} from '../../dominio/puertos/curriculo.puerto';

export interface EntradaActualizarAsignatura {
  id: string;
  idAreaCurricular?: string;
  codigo?: string;
  nombre?: string;
  nombreCorto?: string | null;
  descripcion?: string | null;
  orden?: number;
}

export class ActualizarAsignaturaCasoUso {
  constructor(private readonly repositorio: RepositorioAsignaturas) {}

  async ejecutar(
    entrada: EntradaActualizarAsignatura,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    const asignatura = await this.repositorio.obtenerAsignaturaBase(
      entrada.id,
      alcance.institucionId,
    );
    if (!asignatura) throw new AsignaturaNoEncontradaError();

    // RN-CUR-005: no cambiar área si usada en plan activo
    if (
      entrada.idAreaCurricular &&
      entrada.idAreaCurricular !== asignatura.idAreaCurricular
    ) {
      if (
        !(await this.repositorio.existeAreaEnInstitucion(
          entrada.idAreaCurricular,
          alcance.institucionId,
        ))
      ) {
        throw new AsignaturaAreaFueraDeInstitucionError();
      }
      if (
        await this.repositorio.estaAsignaturaEnPlanActivo(
          entrada.id,
          alcance.institucionId,
        )
      ) {
        throw new AsignaturaAreaFueraDeInstitucionError();
      }
    }

    const codigoNorm = entrada.codigo
      ? entrada.codigo.trim().toUpperCase()
      : undefined;

    if (codigoNorm) {
      if (
        await this.repositorio.existeCodigoAsignaturaEnInstitucion(
          codigoNorm,
          alcance.institucionId,
          entrada.id,
        )
      ) {
        throw new AsignaturaCodigoDuplicadoError();
      }
    }

    const idAreaEfectivo =
      entrada.idAreaCurricular ?? asignatura.idAreaCurricular;
    if (entrada.orden !== undefined) {
      if (
        await this.repositorio.existeOrdenAsignaturaEnArea(
          entrada.orden,
          idAreaEfectivo,
          entrada.id,
        )
      ) {
        throw new AsignaturaOrdenDuplicadoError();
      }
    }

    await this.repositorio.actualizarAsignatura({
      id: entrada.id,
      institucionId: alcance.institucionId,
      idAreaCurricular: entrada.idAreaCurricular,
      codigo: entrada.codigo ? entrada.codigo.trim() : undefined,
      codigoNormalizado: codigoNorm,
      nombre: entrada.nombre ? entrada.nombre.trim() : undefined,
      nombreCorto: entrada.nombreCorto,
      descripcion: entrada.descripcion,
      orden: entrada.orden,
    });
  }
}
