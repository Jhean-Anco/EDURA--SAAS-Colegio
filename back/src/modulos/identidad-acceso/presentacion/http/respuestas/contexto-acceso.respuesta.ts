export class ContextoAccesoRespuesta {
  ambito!: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';
  rolId!: string;
  rolCodigo!: string;
  institucionId!: string | null;
  institucionNombre!: string | null;
  sedeId!: string | null;
  sedeNombre!: string | null;
}
