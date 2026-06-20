export const CALCULADOR_RUTAS = Symbol('CALCULADOR_RUTAS');

export interface PuntoGeografico {
  latitud: number;
  longitud: number;
}

export interface ResultadoCalculoRuta {
  disponible: boolean;
  resultado: {
    distanciaMetros: number;
    duracionSegundos: number;
    resumenRuta: string;
  } | null;
  advertencias: string[];
}

export interface CalculadorRutas {
  calcular(
    origen: PuntoGeografico,
    destino: PuntoGeografico,
  ): Promise<ResultadoCalculoRuta>;
}
