import {
  ConsultadorDocentes,
  FichaDocente,
} from '../dominio/puertos/docentes.puerto';
import { PerfilDocenteNoVinculadoError } from '../dominio/errores-docentes';

export class ObtenerMiPerfilDocenteCasoUso {
  constructor(private readonly consultador: ConsultadorDocentes) {}

  async ejecutar(
    idPersona: string,
    institucionId: string,
  ): Promise<FichaDocente> {
    const ficha = await this.consultador.obtenerPorPersona(
      idPersona,
      institucionId,
    );
    if (!ficha) throw new PerfilDocenteNoVinculadoError();
    return ficha;
  }
}
