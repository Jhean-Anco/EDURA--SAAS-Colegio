import {
  AsignaturaCodigoDuplicadoError,
  AsignaturaOrdenDuplicadoError,
  AsignaturaAreaFueraDeInstitucionError,
  AmbiteInstitucionRequeridoError,
} from '../../dominio/errores-curriculo';
import {
  AlcanceAcceso,
  RepositorioAsignaturas,
} from '../../dominio/puertos/curriculo.puerto';

export interface EntradaCrearAsignatura {
  idAreaCurricular: string;
  codigo: string;
  nombre: string;
  nombreCorto?: string | null;
  descripcion?: string | null;
  orden: number;
}

export class CrearAsignaturaCasoUso {
  constructor(private readonly repositorio: RepositorioAsignaturas) {}

  async ejecutar(
    entrada: EntradaCrearAsignatura,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string }> {
    if (alcance.ambito !== 'INSTITUCION')
      throw new AmbiteInstitucionRequeridoError();

    // RN-CUR-001: área pertenece a la institución
    if (
      !(await this.repositorio.existeAreaEnInstitucion(
        entrada.idAreaCurricular,
        alcance.institucionId,
      ))
    ) {
      throw new AsignaturaAreaFueraDeInstitucionError();
    }

    const codigoNorm = entrada.codigo.trim().toUpperCase();

    if (
      await this.repositorio.existeCodigoAsignaturaEnInstitucion(
        codigoNorm,
        alcance.institucionId,
      )
    ) {
      throw new AsignaturaCodigoDuplicadoError();
    }
    if (
      await this.repositorio.existeOrdenAsignaturaEnArea(
        entrada.orden,
        entrada.idAreaCurricular,
      )
    ) {
      throw new AsignaturaOrdenDuplicadoError();
    }

    return this.repositorio.crearAsignatura({
      institucionId: alcance.institucionId,
      idAreaCurricular: entrada.idAreaCurricular,
      codigo: entrada.codigo.trim(),
      codigoNormalizado: codigoNorm,
      nombre: entrada.nombre.trim(),
      nombreCorto: entrada.nombreCorto ?? null,
      descripcion: entrada.descripcion ?? null,
      orden: entrada.orden,
    });
  }
}
