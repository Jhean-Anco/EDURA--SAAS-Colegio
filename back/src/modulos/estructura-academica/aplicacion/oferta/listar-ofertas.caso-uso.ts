import {
  AlcanceAcceso,
  ConsultadorEstructuraAcademica,
  EstadoOferta,
  OfertaGradoSedeResumen,
} from '../../dominio/puertos/estructura-academica.puerto';

export class ListarOfertasCasoUso {
  constructor(private readonly consultador: ConsultadorEstructuraAcademica) {}

  async ejecutar(
    alcance: AlcanceAcceso,
    idSede?: string | null,
    idAnio?: string | null,
    estado?: EstadoOferta | null,
  ): Promise<OfertaGradoSedeResumen[]> {
    const sedeId =
      alcance.ambito === 'SEDE' ? (alcance.sedeId ?? idSede) : idSede;
    return this.consultador.listarOfertas(
      alcance.institucionId,
      sedeId,
      idAnio,
      estado,
    );
  }
}
