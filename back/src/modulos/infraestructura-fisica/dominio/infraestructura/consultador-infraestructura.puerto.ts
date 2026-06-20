export interface ElementoInfraestructuraResumen {
  id: string;
  sedeId: string;
  tipoElementoId: string;
  codigo: string;
  nombre: string;
  estado: string;
  orden: number;
}

export const CONSULTADOR_INFRAESTRUCTURA = Symbol(
  'CONSULTADOR_INFRAESTRUCTURA',
);

export interface ConsultadorInfraestructura {
  listarPorSede(sedeId: string): Promise<ElementoInfraestructuraResumen[]>;
}
