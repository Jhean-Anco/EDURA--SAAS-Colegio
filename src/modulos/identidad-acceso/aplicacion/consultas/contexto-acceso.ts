export interface ContextoAccesoSalida {
  usuarioId: string;
  ambito: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';
  institucionId: string | null;
  sedeId: string | null;
}

export class ListarContextosUsuarioConsulta {
  ejecutar(usuarioId: string): Promise<ContextoAccesoSalida[]> {
    return Promise.resolve([
      {
        usuarioId,
        ambito: 'PLATAFORMA',
        institucionId: null,
        sedeId: null,
      },
    ]);
  }
}
