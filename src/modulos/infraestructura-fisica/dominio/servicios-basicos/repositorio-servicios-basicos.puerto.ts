import { ServicioBasicoSedeRespuesta } from './servicio-basico.respuesta';

export const REPOSITORIO_SERVICIOS_BASICOS = Symbol(
  'REPOSITORIO_SERVICIOS_BASICOS',
);

export interface CrearServicioBasicoEntrada {
  id: string;
  sedeId: string;
  tipoServicioBasicoId: string;
  proveedor: string | null;
  numeroSuministro: string | null;
  estadoServicio: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  observaciones: string | null;
}

export interface CambiarEstadoServicioBasicoEntrada {
  id: string;
  estadoServicio: string;
}

export interface RepositorioServiciosBasicos {
  crear(
    entidad: CrearServicioBasicoEntrada,
  ): Promise<ServicioBasicoSedeRespuesta>;
  buscarPorIdEnSede(
    id: string,
    sedeId: string,
  ): Promise<ServicioBasicoSedeRespuesta | null>;
  listarPorSede(sedeId: string): Promise<ServicioBasicoSedeRespuesta[]>;
  cambiarEstado(
    entrada: CambiarEstadoServicioBasicoEntrada & { sedeId: string },
  ): Promise<ServicioBasicoSedeRespuesta>;
  buscarTipoActivoPorCodigo(codigo: string): Promise<unknown>;
  sedeActiva(sedeId: string): Promise<boolean>;
}
