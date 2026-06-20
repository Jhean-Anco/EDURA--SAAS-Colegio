export class CorreoElectronico {
  private constructor(readonly valor: string) {}

  static crear(valor: string): CorreoElectronico {
    const normalizado = valor.trim().toLowerCase();
    if (!normalizado || !normalizado.includes('@')) {
      throw new Error('Correo electronico invalido.');
    }
    return new CorreoElectronico(normalizado);
  }
}
