import { ServicioBasicoSedeRespuesta } from './servicio-basico.respuesta';

export const CONSULTADOR_SERVICIOS_BASICOS = Symbol(
  'CONSULTADOR_SERVICIOS_BASICOS',
);

export interface ConsultadorServiciosBasicos {
  listarPorSede(sedeId: string): Promise<ServicioBasicoSedeRespuesta[]>;
}
