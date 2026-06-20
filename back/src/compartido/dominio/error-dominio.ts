export class ErrorDominio extends Error {
  readonly codigo: string;

  readonly detalles?: Record<string, unknown>;

  constructor(
    codigo: string,
    mensaje: string,
    detalles?: Record<string, unknown>,
  ) {
    super(mensaje);
    this.name = this.constructor.name;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}
