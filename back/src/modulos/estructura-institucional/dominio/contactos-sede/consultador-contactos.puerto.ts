import { ContactoSedeResumen } from './contacto-sede.resumen';

export const CONSULTADOR_CONTACTOS_SEDE = Symbol('CONSULTADOR_CONTACTOS_SEDE');

export interface ConsultadorContactosSede {
  listarPorSede(sedeId: string): Promise<ContactoSedeResumen[]>;
}
