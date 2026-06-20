import {
  RepositorioAuditoria,
  RepositorioSesiones,
} from '../../dominio/puertos/repositorios';
import { EventoAuditoria } from '../../dominio/auditoria/evento-auditoria';
import { randomUUID } from 'node:crypto';

export interface CerrarTodasSesionesEntrada {
  usuarioId: string;
}

export class CerrarTodasSesionesCasoUso {
  constructor(
    private readonly sesiones: RepositorioSesiones,
    private readonly auditoria: RepositorioAuditoria,
  ) {}

  async ejecutar(entrada: CerrarTodasSesionesEntrada): Promise<void> {
    await this.sesiones.revocarPorUsuario(
      entrada.usuarioId,
      'CIERRE_TOTAL',
      new Date(),
    );
    await this.auditoria.registrar(
      new EventoAuditoria(randomUUID(), 'LOGOUT', 'sesion', 'EXITO'),
    );
  }
}
