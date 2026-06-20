import { RecursoNoEncontradoError } from '../../../../compartido/dominio/errores-dominio';
import { DireccionSede } from '../../dominio/direcciones-sede/direccion-sede.entidad';
import { RepositorioDirecciones } from '../../dominio/direcciones-sede/repositorio-direcciones.puerto';
import { RepositorioSedes } from '../../dominio/sedes/repositorio-sedes.puerto';

export interface RegistrarDireccionSedeEntrada {
  id: string;
  institucionId: string;
  sedeId: string;
  direccionLinea: string;
  referencia?: string | null;
  idUbigeo?: string | null;
  latitud?: string | null;
  longitud?: string | null;
  codigoPostal?: string | null;
}

export class RegistrarDireccionSedeCasoUso {
  constructor(
    private readonly sedes: RepositorioSedes,
    private readonly direcciones: RepositorioDirecciones,
  ) {}

  async ejecutar(entrada: RegistrarDireccionSedeEntrada): Promise<void> {
    const sede = await this.sedes.buscarPorInstitucionYId(
      entrada.institucionId,
      entrada.sedeId,
    );
    if (!sede) {
      throw new RecursoNoEncontradoError('La sede solicitada no existe.');
    }
    const direccion = DireccionSede.crear({
      id: entrada.id,
      sedeId: entrada.sedeId,
      idUbigeo: entrada.idUbigeo ?? null,
      direccionLinea: entrada.direccionLinea,
      referencia: entrada.referencia ?? null,
      latitud: entrada.latitud ?? null,
      longitud: entrada.longitud ?? null,
      codigoPostal: entrada.codigoPostal ?? null,
    });
    await this.direcciones.guardar(direccion);
  }
}
