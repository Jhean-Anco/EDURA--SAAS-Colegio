export const CONSULTADOR_SEDES = Symbol('CONSULTADOR_SEDES');

export interface DatosMinimosSede {
  id: string;
  institucionId: string;
  codigo: string;
  nombre: string;
  estado: string;
  esPrincipal: boolean;
}

export interface ConsultadorSedes {
  obtenerPorId(id: string): Promise<DatosMinimosSede | null>;
  obtenerActivaPorId(id: string): Promise<DatosMinimosSede | null>;
  perteneceAInstitucion(
    idSede: string,
    idInstitucion: string,
  ): Promise<boolean>;
  verificarActiva(idSede: string): Promise<boolean>;
}
