import {
  AreaCurricularNoEncontradaError,
  AreaCodigoDuplicadoError,
  AreaNombreDuplicadoError,
  AreaOrdenDuplicadoError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  RepositorioAreasCurriculares,
} from '../../dominio/puertos/curriculo.puerto';

export interface EntradaActualizarAreaCurricular {
  id: string;
  codigo?: string;
  nombre?: string;
  descripcion?: string | null;
  orden?: number;
}

export class ActualizarAreaCurricularCasoUso {
  constructor(private readonly repositorio: RepositorioAreasCurriculares) {}

  async ejecutar(
    entrada: EntradaActualizarAreaCurricular,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    const area = await this.repositorio.obtenerAreaBase(
      entrada.id,
      alcance.institucionId,
    );
    if (!area) throw new AreaCurricularNoEncontradaError();

    const codigoNorm = entrada.codigo
      ? entrada.codigo.trim().toUpperCase()
      : undefined;
    const nombreNorm = entrada.nombre
      ? entrada.nombre.trim().toUpperCase()
      : undefined;

    if (codigoNorm) {
      if (
        await this.repositorio.existeCodigoAreaEnInstitucion(
          codigoNorm,
          alcance.institucionId,
          entrada.id,
        )
      ) {
        throw new AreaCodigoDuplicadoError();
      }
    }
    if (nombreNorm) {
      if (
        await this.repositorio.existeNombreAreaEnInstitucion(
          nombreNorm,
          alcance.institucionId,
          entrada.id,
        )
      ) {
        throw new AreaNombreDuplicadoError();
      }
    }
    if (entrada.orden !== undefined) {
      if (
        await this.repositorio.existeOrdenAreaEnInstitucion(
          entrada.orden,
          alcance.institucionId,
          entrada.id,
        )
      ) {
        throw new AreaOrdenDuplicadoError();
      }
    }

    await this.repositorio.actualizarArea({
      id: entrada.id,
      institucionId: alcance.institucionId,
      codigo: entrada.codigo ? entrada.codigo.trim() : undefined,
      codigoNormalizado: codigoNorm,
      nombre: entrada.nombre ? entrada.nombre.trim() : undefined,
      nombreNormalizado: nombreNorm,
      descripcion: entrada.descripcion,
      orden: entrada.orden,
    });
  }
}
