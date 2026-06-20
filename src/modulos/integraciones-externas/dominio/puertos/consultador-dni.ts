export const CONSULTADOR_DNI = Symbol('CONSULTADOR_DNI');

export interface ResultadoConsultaDni {
  disponible: boolean;
  datosSugeridos: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  } | null;
  advertencias: string[];
}

export interface ConsultadorDni {
  consultar(numeroDni: string): Promise<ResultadoConsultaDni>;
}
