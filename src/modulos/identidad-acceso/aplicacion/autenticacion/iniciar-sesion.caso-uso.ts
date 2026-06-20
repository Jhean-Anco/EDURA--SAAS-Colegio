import { CorreoElectronico } from '../../dominio/valores/correo-electronico';
import { randomUUID } from 'node:crypto';
import {
  RepositorioCredenciales,
  RepositorioUsuarios,
  RepositorioAuditoria,
} from '../../dominio/puertos/repositorios';
import { EventoAuditoria } from '../../dominio/auditoria/evento-auditoria';
import { ServicioHashClaveArgon2 } from '../../infraestructura/criptografia/servicio-hash-clave-argon2';
import { ServicioTokenAccesoJwt } from '../../infraestructura/tokens/servicio-token-acceso-jwt';
import { ServicioTokenOpacoCriptografico } from '../../infraestructura/tokens/servicio-token-opaco';

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
    private readonly auditoria: RepositorioAuditoria,
    private readonly hashClave: ServicioHashClaveArgon2,
    private readonly tokenAcceso: ServicioTokenAccesoJwt,
    private readonly tokenRefresh: ServicioTokenOpacoCriptografico,
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
      throw new Error('Credenciales invalidas');
    }
    const valida = await this.hashClave.verificar(
      credencial.valor,
      entrada.clave,
    );
    if (!valida) {
      await this.credenciales.actualizarIntentosFallidos(usuario.id, 1, null);
      await this.auditoria.registrar(
        new EventoAuditoria(usuario.id, 'LOGIN_FALLO', 'usuario', 'FALLO'),
      );
      throw new Error('Credenciales invalidas');
    }
    const sesionId = randomUUID();
    const refresh = this.tokenRefresh.generar();
    const accessToken = this.tokenAcceso.firmar({
      usuarioId: usuario.id,
      sesionId,
      versionSeguridad: usuario.versionSeguridad,
      ambito: 'PLATAFORMA',
      institucionId: null,
      sedeId: null,
    });
    await this.usuarios.actualizarUltimoAcceso(usuario.id, new Date());
    await this.credenciales.actualizarIntentosFallidos(usuario.id, 0, null);
    await this.auditoria.registrar(
      new EventoAuditoria(usuario.id, 'LOGIN_EXITO', 'usuario', 'EXITO'),
    );
    return {
      usuarioId: usuario.id,
      accessToken,
      refreshToken: refresh.token,
    };
  }
}
