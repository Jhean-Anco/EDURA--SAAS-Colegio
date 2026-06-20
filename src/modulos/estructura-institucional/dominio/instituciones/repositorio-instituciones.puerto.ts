import { InstitucionEducativa } from './institucion-educativa.entidad';

export const REPOSITORIO_INSTITUCIONES = Symbol('REPOSITORIO_INSTITUCIONES');

export interface RepositorioInstituciones {
  guardar(institucion: InstitucionEducativa): Promise<void>;
  buscarPorId(id: string): Promise<InstitucionEducativa | null>;
  buscarPorCodigo(codigo: string): Promise<InstitucionEducativa | null>;
  existeCodigo(codigo: string): Promise<boolean>;
  listarPorAlcance(entrada: {
    ambito: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';
    institucionId: string | null;
  }): Promise<InstitucionEducativa[]>;
  actualizar(institucion: InstitucionEducativa): Promise<void>;
}
