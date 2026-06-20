export class ExcepcionDominio extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ExcepcionDominio';
  }
}
