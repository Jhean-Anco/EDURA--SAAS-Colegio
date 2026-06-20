import { ServicioBasicoSedeRespuesta } from '../../dominio/servicios-basicos/servicio-basico.respuesta';

export interface RepositorioServiciosBasicos {
  crear(input: Record<string, unknown>): Promise<ServicioBasicoSedeRespuesta>;
  listarPorSede(sedeId: string): Promise<ServicioBasicoSedeRespuesta[]>;
  buscarPorId(id: string): Promise<ServicioBasicoSedeRespuesta | null>;
  cambiarEstado(
    id: string,
    estado: string,
  ): Promise<ServicioBasicoSedeRespuesta>;
  buscarTipoActivoPorCodigo(codigo: string): Promise<{ id: string } | null>;
  sedeActiva(sedeId: string): Promise<boolean>;
}

export interface ConsultadorServiciosBasicos {
  listarPorSede(sedeId: string): Promise<ServicioBasicoSedeRespuesta[]>;
}
