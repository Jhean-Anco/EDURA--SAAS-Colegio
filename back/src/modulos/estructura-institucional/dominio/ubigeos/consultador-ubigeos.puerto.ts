import { UbigeoResumen } from './ubigeo.resumen';

export const CONSULTADOR_UBIGEOS = Symbol('CONSULTADOR_UBIGEOS');

export interface ConsultadorUbigeos {
  listar(): Promise<UbigeoResumen[]>;
}
