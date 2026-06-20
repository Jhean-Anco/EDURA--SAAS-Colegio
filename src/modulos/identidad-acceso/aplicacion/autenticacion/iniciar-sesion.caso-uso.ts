import { UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CorreoElectronico } from '../../dominio/valores/correo-electronico';
import {
  RepositorioCredenciales,
  RepositorioUsuarios,
  RepositorioAuditoria,
  RepositorioSesiones,
} from '../../dominio/puertos/repositorios';
import { EventoAuditoria } from '../../dominio/auditoria/evento-auditoria';
import { ServicioHashClaveArgon2 } from '../../infraestructura/criptografia/servicio-hash-clave-argon2';
import { ServicioTokenAccesoJwt } from '../../infraestructura/tokens/servicio-token-acceso-jwt';
import { ServicioTokenOpacoCriptografico } from '../../infraestructura/tokens/servicio-token-opaco';
import { SesionUsuario } from '../../dominio/sesiones/sesion-usuario';
import { PayloadAcceso } from '../../dominio/valores/payload-acceso';

export interface IniciarSesionEntrada {
  correo: string;
  clave: string;
}

export interface IniciarSesionSalida {
  usuarioId: string;
  accessToken: string;
  refreshToken: string;
}

export class IniciarSesionCasoUso {
  constructor(
    private readonly usuarios: RepositorioUsuarios,
    private readonly credenciales: RepositorioCredenciales,
    private readonly sesiones: RepositorioSesiones,
    private readonly auditoria: RepositorioAuditoria,
    private readonly hashClave: ServicioHashClaveArgon2,
    private readonly tokenAcceso: ServicioTokenAccesoJwt,
    private readonly tokenRefresh: ServicioTokenOpacoCriptografico,
    private readonly jwtAccesoTtlSegundos: number,
    private readonly tokenRefreshTtlSegundos: number,
  ) {}

  async ejecutar(entrada: IniciarSesionEntrada): Promise<IniciarSesionSalida> {
    const correo = CorreoElectronico.crear(entrada.correo);
    const usuario = await this.usuarios.buscarPorCorreoNormalizado(
      correo.valor,
    );
    const credencial = usuario
      ? await this.credenciales.obtenerHashPorUsuario(usuario.id)
      : null;
    if (!usuario || !credencial) {
      await this.auditoria.registrar(
        new EventoAuditoria(randomUUID(), 'LOGIN_FALLO', 'usuario', 'FALLO'),
      );
      throw new UnauthorizedException('CREDENCIALES_INVALIDAS');
    }
    const valida = await this.hashClave.verificar(
      credencial.valor,
      entrada.clave,
    );
    if (!valida) {
      await this.credenciales.actualizarIntentosFallidos(usuario.id, 1, null);
      await this.auditoria.registrar(
        new EventoAuditoria(randomUUID(), 'LOGIN_FALLO', 'usuario', 'FALLO'),
      );
      throw new UnauthorizedException('CREDENCIALES_INVALIDAS');
    }
    const sesionId = randomUUID();
    const familiaId = randomUUID();
    const refresh = this.tokenRefresh.generar();
    const sesion = new SesionUsuario(
      sesionId,
      usuario.id,
      familiaId,
      refresh.hash,
      null,
      new Date(Date.now() + this.tokenRefreshTtlSegundos * 1000),
    );
    await this.sesiones.crear(sesion);
    const payload: PayloadAcceso = {
      sub: usuario.id,
      sid: sesionId,
      versionSeguridad: usuario.versionSeguridad,
      tipoToken: 'PRECONTEXTO',
      ambito: null,
      rolId: null,
      institucionId: null,
      sedeId: null,
    };
    const accessToken = this.tokenAcceso.firmar(
      payload,
      this.jwtAccesoTtlSegundos,
    );
    await this.usuarios.actualizarUltimoAcceso(usuario.id, new Date());
    await this.credenciales.actualizarIntentosFallidos(usuario.id, 0, null);
    await this.auditoria.registrar(
      new EventoAuditoria(randomUUID(), 'LOGIN_EXITO', 'usuario', 'EXITO'),
    );
    return {
      usuarioId: usuario.id,
      accessToken,
      refreshToken: refresh.token,
    };
  }
}
