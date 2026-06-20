export interface Paginacion {
  pagina: number;
  tamano: number;
}

export function normalizarPaginacion(entrada: {
  pagina?: unknown;
  tamano?: unknown;
}): Paginacion {
  const pagina = Number(entrada.pagina ?? 1);
  const tamano = Number(entrada.tamano ?? 20);

  if (
    !Number.isInteger(pagina) ||
    !Number.isInteger(tamano) ||
    pagina < 1 ||
    tamano < 1 ||
    tamano > 100
  ) {
    throw new Error('PARAMETROS_DE_PAGINACION_INVALIDOS');
  }

  return { pagina, tamano };
}
