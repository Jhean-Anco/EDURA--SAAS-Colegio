export class EventoAuditoria {
  constructor(
    readonly id: string,
    readonly accion: string,
    readonly recurso: string,
    readonly resultado: 'EXITO' | 'FALLO' | 'DENEGADO',
  ) {}
}
