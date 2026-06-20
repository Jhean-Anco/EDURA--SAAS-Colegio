export interface CasoUso<Entrada, Salida> {
  ejecutar(entrada: Entrada): Promise<Salida>;
}
