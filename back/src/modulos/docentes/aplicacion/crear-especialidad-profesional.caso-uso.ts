import {
  AlcanceAcceso,
  RepositorioEspecialidadesProfesionales,
} from '../dominio/puertos/docentes.puerto';
import { EspecialidadDuplicadaError } from '../dominio/errores-docentes';

export class CrearEspecialidadProfesionalCasoUso {
  constructor(
    private readonly repositorio: RepositorioEspecialidadesProfesionales,
  ) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    codigo: string;
    nombre: string;
    descripcion?: string | null;
  }): Promise<{ id: string }> {
    const { alcance } = entrada;

    const codigoNormalizado = entrada.codigo.trim().toUpperCase();
    const nombreNormalizado = entrada.nombre
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');

    if (
      (await this.repositorio.existeCodigoNormalizadoEsp(
        codigoNormalizado,
        alcance.institucionId,
      )) ||
      (await this.repositorio.existeNombreNormalizadoEsp(
        nombreNormalizado,
        alcance.institucionId,
      ))
    ) {
      throw new EspecialidadDuplicadaError();
    }

    return this.repositorio.crearEspecialidad({
      institucionId: alcance.institucionId,
      codigo: entrada.codigo.trim(),
      codigoNormalizado,
      nombre: entrada.nombre.trim(),
      nombreNormalizado,
      descripcion: entrada.descripcion ?? null,
    });
  }
}
