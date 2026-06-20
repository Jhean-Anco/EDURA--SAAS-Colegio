import { Inject } from '@nestjs/common';
import { InstitucionEducativa } from '../../dominio/instituciones/institucion-educativa.entidad';
import {
  REPOSITORIO_INSTITUCIONES,
  RepositorioInstituciones,
} from '../../dominio/instituciones/repositorio-instituciones.puerto';

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
  constructor(
    @Inject(REPOSITORIO_INSTITUCIONES)
    private readonly repositorio: RepositorioInstituciones,
  ) {}

  async ejecutar(
    entrada: CrearInstitucionEntrada,
  ): Promise<CrearInstitucionSalida> {
    const existe = await this.repositorio.existeCodigo(entrada.codigo);
    if (existe) {
      throw new Error('codigo-duplicado');
    }
    const institucion = InstitucionEducativa.crear(entrada);
    await this.repositorio.guardar(institucion);
    return { id: institucion.id };
  }
}
