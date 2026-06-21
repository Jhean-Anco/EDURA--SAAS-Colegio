import {
  AlcanceAcceso,
  ConsultadorDocentes,
  FichaDocente,
} from '../dominio/puertos/docentes.puerto';
import { DocenteNoEncontradoError } from '../dominio/errores-docentes';

export class ObtenerDocenteCasoUso {
  constructor(private readonly consultador: ConsultadorDocentes) {}

  async ejecutar(id: string, alcance: AlcanceAcceso): Promise<FichaDocente> {
    const ficha = await this.consultador.obtener(id, alcance);
    if (!ficha) throw new DocenteNoEncontradoError();
    return ficha;
  }
}
