export class ContactoRespuesta {
  id!: string;
  sedeId!: string;
  tipoCanal!: string;
  etiqueta!: string | null;
  valor!: string;
  valorNormalizado!: string;
  esPrincipal!: boolean;
  visiblePublicamente!: boolean;
  estado!: string;
  orden!: number;
}
