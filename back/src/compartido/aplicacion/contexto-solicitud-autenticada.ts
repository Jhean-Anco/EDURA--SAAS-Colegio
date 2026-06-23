export interface ContextoSolicitudAutenticada {
  usuarioId: string;
  sesionId: string;
  versionSeguridad: number;
  tipoToken: 'PRECONTEXTO' | 'ACCESO';
  ambito: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE' | null;
  rolId: string | null;
  institucionId: string | null;
  sedeId: string | null;
  canalAcceso?: 'PLATAFORMA' | 'INSTITUCION';
  institucionAccesoId?: string | null;
  puntoAccesoId?: string | null;
}
