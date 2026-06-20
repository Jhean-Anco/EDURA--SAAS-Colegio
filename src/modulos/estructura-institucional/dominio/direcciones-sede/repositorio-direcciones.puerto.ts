import { DireccionSede } from './direccion-sede.entidad';

export const REPOSITORIO_DIRECCIONES = Symbol('REPOSITORIO_DIRECCIONES');

export interface RepositorioDirecciones {
  buscarPorSede(sedeId: string): Promise<DireccionSede | null>;
  guardar(direccion: DireccionSede): Promise<void>;
}
