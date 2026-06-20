import { randomUUID } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import {
  RepositorioAuditoria,
  RepositorioSesiones,
  RepositorioUsuarios,
} from '../../dominio/puertos/repositorios';
import { EventoAuditoria } from '../../dominio/auditoria/evento-auditoria';
import { ServicioTokenOpacoCriptografico } from '../../infraestructura/tokens/servicio-token-opaco';
import { ServicioTokenAccesoJwt } from '../../infraestructura/tokens/servicio-token-acceso-jwt';
import { SesionUsuario } from '../../dominio/sesiones/sesion-usuario';
import { PayloadAcceso } from '../../dominio/valores/payload-acceso';

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
    private readonly usuarios: RepositorioUsuarios,
    private readonly auditoria: RepositorioAuditoria,
    private readonly tokenRefresh: ServicioTokenOpacoCriptografico,
    private readonly tokenAcceso: ServicioTokenAccesoJwt,
    private readonly jwtAccesoTtlSegundos: number,
    private readonly tokenRefreshTtlSegundos: number,
  ) {}

  async ejecutar(entrada: RenovarSesionEntrada): Promise<RenovarSesionSalida> {
    const hash = this.tokenRefresh.hash(entrada.refreshToken);
    const sesion = await this.sesiones.buscarPorHashRefresh(hash);

    if (
      !sesion ||
      sesion.fechaRevocacion !== null ||
      (sesion.fechaExpiracion !== null && sesion.fechaExpiracion < new Date())
    ) {
      await this.auditoria.registrar(
        new EventoAuditoria(
          randomUUID(),
          'REFRESH_INVALIDO',
          'sesion',
          'FALLO',
        ),
      );
      throw new UnauthorizedException('SESION_INVALIDA');
    }

    const usuario = await this.usuarios.buscarPorId(sesion.usuarioId);
    if (!usuario || usuario.estado !== 'ACTIVO') {
      await this.auditoria.registrar(
        new EventoAuditoria(
          randomUUID(),
          'REFRESH_USUARIO_INACTIVO',
          'sesion',
          'FALLO',
        ),
      );
      throw new UnauthorizedException('USUARIO_INACTIVO');
    }

    const nuevoRefresh = this.tokenRefresh.generar();
    const expiracion = new Date(
      Date.now() + this.tokenRefreshTtlSegundos * 1000,
    );
    const nuevaSesion = new SesionUsuario(
      randomUUID(),
      sesion.usuarioId,
      sesion.familiaId,
      nuevoRefresh.hash,
      sesion.id,
      expiracion,
    );
    await this.sesiones.crear(nuevaSesion);
    await this.sesiones.revocar(sesion.id, 'ROTADA', new Date());

    const accessToken = this.tokenAcceso.firmar(
      {
        sub: sesion.usuarioId,
        sid: nuevaSesion.id,
        versionSeguridad: usuario.versionSeguridad,
        tipoToken: 'PRECONTEXTO',
        ambito: null,
        rolId: null,
        institucionId: null,
        sedeId: null,
      } satisfies PayloadAcceso,
      this.jwtAccesoTtlSegundos,
    );

    await this.auditoria.registrar(
      new EventoAuditoria(randomUUID(), 'SESION_RENOVADA', 'sesion', 'EXITO'),
    );

    return { accessToken, refreshToken: nuevoRefresh.token };
  }
}
