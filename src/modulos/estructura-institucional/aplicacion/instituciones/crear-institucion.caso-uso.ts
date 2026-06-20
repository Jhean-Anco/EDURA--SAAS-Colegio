import { CodigoDuplicadoError } from '../../../../compartido/dominio/errores-dominio';
import { InstitucionEducativa } from '../../dominio/instituciones/institucion-educativa.entidad';
import { InstitucionTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/institucion.typeorm-repositorio';

export interface CrearInstitucionEntrada {
  id: string;
  codigo: string;
  nombreLegal: string;
  nombreCorto?: string | null;
  tipoGestion?: string | null;
}

export interface CrearInstitucionSalida {
  id: string;
}

export class CrearInstitucionCasoUso {
  constructor(private readonly repositorio: InstitucionTypeormRepositorio) {}

  async ejecutar(
    entrada: CrearInstitucionEntrada,
  ): Promise<CrearInstitucionSalida> {
    const existe = await this.repositorio.existeCodigo(entrada.codigo);
    if (existe) {
      throw new CodigoDuplicadoError('El codigo de institucion ya existe.');
    }
    const institucion = InstitucionEducativa.crear(entrada);
    await this.repositorio.guardar(institucion);
    return { id: institucion.id };
  }
}
