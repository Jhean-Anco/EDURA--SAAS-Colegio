export interface ServicioBasicoSedeRespuesta {
  id: string;
  sedeId: string;
  tipoServicioBasicoId: string;
  proveedor: string | null;
  numeroSuministro: string | null;
  estadoServicio: string;
  fechaInicio: string | null;
  fechaFin: string | null;
}
