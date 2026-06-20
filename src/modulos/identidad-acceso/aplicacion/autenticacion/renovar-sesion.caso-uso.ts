import { randomUUID } from 'node:crypto';
import {
  RepositorioAuditoria,
  RepositorioSesiones,
} from '../../dominio/puertos/repositorios';
import { EventoAuditoria } from '../../dominio/auditoria/evento-auditoria';
import { ServicioTokenOpacoCriptografico } from '../../infraestructura/tokens/servicio-token-opaco';
import { ServicioTokenAccesoJwt } from '../../infraestructura/tokens/servicio-token-acceso-jwt';
import { SesionUsuario } from '../../dominio/sesiones/sesion-usuario';

export interface RenovarSesionEntrada {
  refreshToken: string;
}

export interface RenovarSesionSalida {
  accessToken: string;
  refreshToken: string;
}

export class RenovarSesionCasoUso {
  constructor(
    private readonly sesiones: RepositorioSesiones,
    private readonly auditoria: RepositorioAuditoria,
    private readonly tokenRefresh: ServicioTokenOpacoCriptografico,
    private readonly tokenAcceso: ServicioTokenAccesoJwt,
  ) {}

  async ejecutar(entrada: RenovarSesionEntrada): Promise<RenovarSesionSalida> {
    const hash = this.tokenRefresh.hash(entrada.refreshToken);
    const sesion = await this.sesiones.buscarPorHashRefresh(hash);
    if (
      !sesion ||
      (sesion.fechaExpiracion !== null &&
        sesion.fechaExpiracion < new Date()) ||
      sesion.fechaRevocacion
    ) {
      await this.auditoria.registrar(
        new EventoAuditoria('0', 'SESION_REVOCADA', 'sesion', 'FALLO'),
      );
      throw new Error('Sesion invalida');
    }
    const nuevoRefresh = this.tokenRefresh.generar();
    const nuevaSesion = new SesionUsuario(
      randomUUID(),
      sesion.usuarioId,
      sesion.familiaId,
      nuevoRefresh.hash,
      sesion.id,
      new Date(Date.now() + 15 * 60 * 1000),
    );
    await this.sesiones.crear(nuevaSesion);
    await this.sesiones.revocar(sesion.id, 'ROTADA', new Date());
    const accessToken = this.tokenAcceso.firmar({
      usuarioId: sesion.usuarioId,
      sesionId: nuevaSesion.id,
      versionSeguridad: 1,
      ambito: 'PLATAFORMA',
      institucionId: null,
      sedeId: null,
    });
    await this.auditoria.registrar(
      new EventoAuditoria(
        sesion.usuarioId,
        'SESION_RENOVADA',
        'sesion',
        'EXITO',
      ),
    );
    return { accessToken, refreshToken: nuevoRefresh.token };
  }
}
