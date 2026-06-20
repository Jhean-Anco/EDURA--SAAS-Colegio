import { ConsultadorContactosSede } from '../../dominio/contactos-sede/consultador-contactos.puerto';
import { ContactoSedeResumen } from '../../dominio/contactos-sede/contacto-sede.resumen';

export class ListarContactosSedeConsulta {
  constructor(private readonly consultador: ConsultadorContactosSede) {}

  ejecutar(idSede: string): Promise<ContactoSedeResumen[]> {
    return this.consultador.listarPorSede(idSede);
  }
}
