import { Sede } from './sede.entidad';

export const REPOSITORIO_SEDES = Symbol('REPOSITORIO_SEDES');

export interface RepositorioSedes {
  guardar(sede: Sede): Promise<void>;
  buscarPorId(id: string): Promise<Sede | null>;
  buscarPorInstitucionYId(
    institucionId: string,
    sedeId: string,
  ): Promise<Sede | null>;
  buscarPorInstitucionYCodigo(
    institucionId: string,
    codigo: string,
  ): Promise<Sede | null>;
  listarPorInstitucion(institucionId: string): Promise<Sede[]>;
  obtenerPrincipal(institucionId: string): Promise<Sede | null>;
  establecerPrincipalAtomicamente(
    institucionId: string,
    sedeId: string,
  ): Promise<void>;
  guardarDireccion(sedeId: string, direccionId: string): Promise<void>;
  cambiarEstado(sedeId: string, estado: Sede['estado']): Promise<void>;
}
