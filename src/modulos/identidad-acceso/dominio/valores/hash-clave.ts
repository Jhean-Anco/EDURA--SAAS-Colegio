export class HashClave {
  private constructor(readonly valor: string) {}

  static crear(valor: string): HashClave {
    if (!valor.trim()) throw new Error('Hash de clave invalido.');
    return new HashClave(valor);
  }
}
