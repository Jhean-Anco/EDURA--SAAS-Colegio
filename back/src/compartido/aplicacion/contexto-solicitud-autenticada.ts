export interface ContextoSolicitudAutenticada {
  usuarioId: string;
  sesionId: string;
  versionSeguridad: number;
  tipoToken: 'PRECONTEXTO' | 'ACCESO';
  ambito: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE' | null;
  rolId: string | null;
  institucionId: string | null;
  sedeId: string | null;
}
