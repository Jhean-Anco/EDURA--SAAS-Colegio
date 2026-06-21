export interface BackendError {
  codigo: string;
  correlacionId: string;
  mensaje: string;
  ruta: string;
  fecha: string;
}

export interface ApiResponse<T> {
  data: T;
}

export function esBackendError(value: unknown): value is BackendError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'codigo' in value &&
    'correlacionId' in value &&
    typeof (value as Record<string, unknown>).codigo === 'string'
  );
}
