import {
  AlcanceAcceso,
  ConsultadorEstructuraAcademica,
  PeriodoActivoPanel,
} from '../../dominio/puertos/estructura-academica.puerto';

export class ObtenerPeriodoActivoCasoUso {
  constructor(private readonly consultador: ConsultadorEstructuraAcademica) {}

  async ejecutar(alcance: AlcanceAcceso): Promise<PeriodoActivoPanel | null> {
    return this.consultador.obtenerPeriodoActivo(alcance.institucionId);
  }
}
