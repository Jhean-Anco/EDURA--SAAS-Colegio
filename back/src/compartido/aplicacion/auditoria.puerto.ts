export const SERVICIO_AUDITORIA = Symbol('SERVICIO_AUDITORIA');

export interface EntradaEventoAuditoria {
  institucionId: string | null;
  sedeId?: string | null;
  usuarioId: string | null;
  accion: string;
  recurso: string;
  idRecurso?: string | null;
  resultado: 'EXITO' | 'ERROR';
  datosAnteriores?: Record<string, unknown> | null;
  datosNuevos?: Record<string, unknown> | null;
  metadatos?: Record<string, unknown> | null;
  idCorrelacion: string;
  direccionIp?: string | null;
  agenteUsuario?: string | null;
}

export interface ServicioAuditoria {
  registrar(entrada: EntradaEventoAuditoria): Promise<void>;
}
