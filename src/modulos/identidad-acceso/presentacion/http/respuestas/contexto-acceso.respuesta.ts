export class ContextoAccesoRespuesta {
  usuarioId!: string;
  ambito!: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';
  institucionId!: string | null;
  sedeId!: string | null;
}
