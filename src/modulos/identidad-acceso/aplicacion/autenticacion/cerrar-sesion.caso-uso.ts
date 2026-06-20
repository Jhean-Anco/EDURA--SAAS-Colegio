import {
  RepositorioAuditoria,
  RepositorioSesiones,
} from '../../dominio/puertos/repositorios';
import { EventoAuditoria } from '../../dominio/auditoria/evento-auditoria';

export interface CerrarSesionEntrada {
  sesionId: string;
  usuarioId: string;
}

export class CerrarSesionCasoUso {
  constructor(
    private readonly sesiones: RepositorioSesiones,
    private readonly auditoria: RepositorioAuditoria,
  ) {}

  async ejecutar(entrada: CerrarSesionEntrada): Promise<void> {
    await this.sesiones.revocar(entrada.sesionId, 'CIERRE_MANUAL', new Date());
    await this.auditoria.registrar(
      new EventoAuditoria(entrada.usuarioId, 'LOGOUT', 'sesion', 'EXITO'),
    );
  }
}
