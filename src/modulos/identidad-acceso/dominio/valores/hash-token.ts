export class HashToken {
  private constructor(readonly valor: string) {}

  static crear(valor: string): HashToken {
    if (!valor.trim()) throw new Error('Hash de token invalido.');
    return new HashToken(valor);
  }
}
