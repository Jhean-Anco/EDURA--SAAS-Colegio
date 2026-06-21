export type Ambito = 'INSTITUCION' | 'SEDE';

export interface ContextoDescriptor {
  institucionId: string;
  nombreInstitucion: string;
  ambito: Ambito;
  sedeId: string | null;
  nombreSede: string | null;
  permisos: string[];
  roles: string[];
}

export interface SesionCliente {
  nombreCompleto: string;
  email: string;
  contexto: ContextoDescriptor;
}

export interface EduraSession {
  accessToken?: string;
  refreshToken?: string;
  contexto?: ContextoDescriptor;
  nombreCompleto?: string;
  email?: string;
  csrfToken?: string;
}
