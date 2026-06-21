import {
  AreaCodigoDuplicadoError,
  AreaNombreDuplicadoError,
  AreaOrdenDuplicadoError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  RepositorioAreasCurriculares,
} from '../../dominio/puertos/curriculo.puerto';

export interface EntradaCrearAreaCurricular {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  orden: number;
}

export class CrearAreaCurricularCasoUso {
  constructor(private readonly repositorio: RepositorioAreasCurriculares) {}

  async ejecutar(
    entrada: EntradaCrearAreaCurricular,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    const codigoNorm = entrada.codigo.trim().toUpperCase();
    const nombreNorm = entrada.nombre.trim().toUpperCase();

    if (
      await this.repositorio.existeCodigoAreaEnInstitucion(
        codigoNorm,
        alcance.institucionId,
      )
    ) {
      throw new AreaCodigoDuplicadoError();
    }
    if (
      await this.repositorio.existeNombreAreaEnInstitucion(
        nombreNorm,
        alcance.institucionId,
      )
    ) {
      throw new AreaNombreDuplicadoError();
    }
    if (
      await this.repositorio.existeOrdenAreaEnInstitucion(
        entrada.orden,
        alcance.institucionId,
      )
    ) {
      throw new AreaOrdenDuplicadoError();
    }

    return this.repositorio.crearArea({
      institucionId: alcance.institucionId,
      codigo: entrada.codigo.trim(),
      codigoNormalizado: codigoNorm,
      nombre: entrada.nombre.trim(),
      nombreNormalizado: nombreNorm,
      descripcion: entrada.descripcion ?? null,
      orden: entrada.orden,
    });
  }
}
