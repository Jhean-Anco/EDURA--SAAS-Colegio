import {
  AlcanceAcceso,
  ConsultadorDocentes,
  FichaDocente,
} from '../dominio/puertos/docentes.puerto';
import { PerfilDocenteNoVinculadoError } from '../dominio/errores-docentes';

export class ObtenerMiPerfilDocenteCasoUso {
  constructor(private readonly consultador: ConsultadorDocentes) {}

  async ejecutar(alcance: AlcanceAcceso): Promise<FichaDocente> {
    const ficha = await this.consultador.obtenerPorUsuario(alcance);
    if (!ficha) throw new PerfilDocenteNoVinculadoError();
    return ficha;
  }
}
