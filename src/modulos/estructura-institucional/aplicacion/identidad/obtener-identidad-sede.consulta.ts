import { ConsultadorIdentidadSede } from '../../dominio/identidades-sede/consultador-identidad-sede.puerto';
import { IdentidadSedeResumen } from '../../dominio/identidades-sede/identidad-sede.resumen';

export class ObtenerIdentidadSedeConsulta {
  constructor(private readonly consultador: ConsultadorIdentidadSede) {}

  ejecutar(idSede: string): Promise<IdentidadSedeResumen | null> {
    return this.consultador.obtenerPorSede(idSede);
  }
}
