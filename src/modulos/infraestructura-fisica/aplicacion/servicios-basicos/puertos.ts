import { ServicioBasicoSedeRespuesta } from '../../dominio/servicios-basicos/servicio-basico.respuesta';
import {
  CambiarEstadoServicioBasicoEntrada,
  CrearServicioBasicoEntrada,
} from '../../dominio/servicios-basicos/repositorio-servicios-basicos.puerto';

export const CONSULTADOR_SERVICIOS_BASICOS = Symbol(
  'CONSULTADOR_SERVICIOS_BASICOS',
);

export interface RepositorioServiciosBasicos {
  crear(
    input: CrearServicioBasicoEntrada,
  ): Promise<ServicioBasicoSedeRespuesta>;
  listarPorSede(sedeId: string): Promise<ServicioBasicoSedeRespuesta[]>;
  buscarPorIdEnSede(
    id: string,
    sedeId: string,
  ): Promise<ServicioBasicoSedeRespuesta | null>;
  cambiarEstado(
    entrada: CambiarEstadoServicioBasicoEntrada & { sedeId: string },
  ): Promise<ServicioBasicoSedeRespuesta>;
  buscarTipoActivoPorCodigo(codigo: string): Promise<{ id: string } | null>;
  sedeActiva(sedeId: string): Promise<boolean>;
}

export interface ConsultadorServiciosBasicos {
  listarPorSede(sedeId: string): Promise<ServicioBasicoSedeRespuesta[]>;
}
