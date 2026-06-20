export const CONSULTADOR_RUC = Symbol('CONSULTADOR_RUC');

export interface ResultadoConsultaRuc {
  disponible: boolean;
  datosSugeridos: {
    razonSocial: string;
    nombreComercial: string | null;
    direccionFiscal: string | null;
    estado: string;
  } | null;
  advertencias: string[];
}

export interface ConsultadorRuc {
  consultar(ruc: string): Promise<ResultadoConsultaRuc>;
}
