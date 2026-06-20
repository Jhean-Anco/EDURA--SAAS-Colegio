export class IdentidadRespuesta {
  id!: string;
  sedeId!: string;
  nombrePublico!: string;
  slugPublico!: string | null;
  descripcionCorta!: string | null;
  lema!: string | null;
  colorPrimario!: string | null;
  colorSecundario!: string | null;
  estadoPublicacion!: string;
  fechaPublicacion!: Date | null;
  version!: number;
}
