import { ServicioBasicoSedeRespuesta } from './servicio-basico.respuesta';

export const REPOSITORIO_SERVICIOS_BASICOS = Symbol(
  'REPOSITORIO_SERVICIOS_BASICOS',
);

export interface RepositorioServiciosBasicos {
  crear(entidad: Record<string, unknown>): Promise<ServicioBasicoSedeRespuesta>;
  buscarPorId(id: string): Promise<ServicioBasicoSedeRespuesta | null>;
  listarPorSede(sedeId: string): Promise<ServicioBasicoSedeRespuesta[]>;
  cambiarEstado(
    id: string,
    estadoServicio: string,
  ): Promise<ServicioBasicoSedeRespuesta>;
  buscarTipoActivoPorCodigo(codigo: string): Promise<unknown>;
  sedeActiva(sedeId: string): Promise<boolean>;
}
