export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

export function entornoPermiteSemillasDemo(entorno: string): boolean {
  return ['desarrollo', 'test', 'development', 'ci'].includes(entorno);
}
