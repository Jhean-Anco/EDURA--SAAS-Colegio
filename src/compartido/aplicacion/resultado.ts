export type Resultado<T> =
  | { exito: true; valor: T }
  | { exito: false; error: string };
