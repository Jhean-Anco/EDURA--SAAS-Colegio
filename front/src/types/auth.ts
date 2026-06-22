export type Ambito = 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';

export interface ContextoDescriptor {
  ambito: Ambito;
  rolId: string;
  rolCodigo: string;
  institucionId: string | null;
  institucionNombre: string | null;
  sedeId: string | null;
  sedeNombre: string | null;
  permisos: string[];
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
  usuarioId?: string;
  requiereCambioClave?: boolean;
}
