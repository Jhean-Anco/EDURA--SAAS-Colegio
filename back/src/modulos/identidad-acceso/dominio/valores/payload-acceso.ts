export interface PayloadAcceso {
  sub: string;
  sid: string;
  versionSeguridad: number;
  tipoToken: 'PRECONTEXTO' | 'ACCESO';
  ambito: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE' | null;
  rolId: string | null;
  institucionId: string | null;
  sedeId: string | null;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}
