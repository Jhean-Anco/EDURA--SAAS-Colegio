import { UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { CorreoElectronico } from '../../dominio/valores/correo-electronico';
import {
  RepositorioCredenciales,
  RepositorioUsuarios,
  RepositorioAuditoria,
  RepositorioSesiones,
} from '../../dominio/puertos/repositorios';
import { ResolvedorPuntoAccesoInstitucion } from '../../../identidad-visual/dominio/puertos/puertos';
import { EventoAuditoria } from '../../dominio/auditoria/evento-auditoria';
import { ServicioHashClaveArgon2 } from '../../infraestructura/criptografia/servicio-hash-clave-argon2';
import { ServicioTokenAccesoJwt } from '../../infraestructura/tokens/servicio-token-acceso-jwt';
import { ServicioTokenOpacoCriptografico } from '../../infraestructura/tokens/servicio-token-opaco';
import { SesionUsuario } from '../../dominio/sesiones/sesion-usuario';
import { PayloadAcceso } from '../../dominio/valores/payload-acceso';

export interface IniciarSesionEntrada {
  correo: string;
  clave: string;
  acceso?: {
    tipo: 'PLATAFORMA' | 'INSTITUCION';
    identificador?: string;
    tipoIdentificador?: string;
  };
}

export interface IniciarSesionSalida {
  usuarioId: string;
  nombreMostrado: string;
  correo: string;
  requiereCambioClave: boolean;
  accessToken: string;
  refreshToken: string;
}

export class IniciarSesionCasoUso {
  private readonly DUMMY_HASH =
    '$argon2id$v=19$m=65536,t=3,p=4$dummyhashdummyhashdummyhash$L3pPzXGz/aGvS1x3K6sWb5dEwW1Z3E5W6Z8E9W0Z1E4';

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
    private readonly resolvedorAcceso: ResolvedorPuntoAccesoInstitucion,
    private readonly dataSource: DataSource,
  ) {}

  async ejecutar(entrada: IniciarSesionEntrada): Promise<IniciarSesionSalida> {
    let canalAcceso: 'PLATAFORMA' | 'INSTITUCION' | undefined = undefined;
    let institucionAccesoId: string | null = null;
    let puntoAccesoId: string | null = null;

    if (entrada.acceso) {
      const resAcceso = await this.resolvedorAcceso.resolver(
        entrada.acceso.tipo,
        entrada.acceso.identificador || '',
      );

      canalAcceso = resAcceso.tipoAcceso;
      institucionAccesoId = resAcceso.institucionId;
      puntoAccesoId = resAcceso.puntoAccesoId;

      if (canalAcceso === 'INSTITUCION' && !institucionAccesoId) {
        await this.auditoria.registrar(
          new EventoAuditoria(randomUUID(), 'LOGIN_INSTITUCIONAL_FALLO', 'usuario', 'FALLO'),
        );
        throw new UnauthorizedException('INSTITUCION_NO_DISPONIBLE');
      }
    }

    const correo = CorreoElectronico.crear(entrada.correo);
    const usuario = await this.usuarios.buscarPorCorreoNormalizado(
      correo.valor,
    );
    const credencial = usuario
      ? await this.credenciales.obtenerPorUsuario(usuario.id)
      : null;

    if (!usuario || !credencial) {
      await this.hashClave.verificar(this.DUMMY_HASH, entrada.clave);
      await this.auditoria.registrar(
        new EventoAuditoria(
          randomUUID(),
          canalAcceso === 'INSTITUCION' ? 'LOGIN_INSTITUCIONAL_FALLO' : 'LOGIN_PLATAFORMA_FALLO',
          'usuario',
          'FALLO',
        ),
      );
      throw new UnauthorizedException('CREDENCIALES_INVALIDAS');
    }

    if (usuario.estado !== 'ACTIVO') {
      await this.hashClave.verificar(credencial.hashClave, entrada.clave);
      await this.auditoria.registrar(
        new EventoAuditoria(
          randomUUID(),
          canalAcceso === 'INSTITUCION' ? 'LOGIN_INSTITUCIONAL_FALLO' : 'LOGIN_PLATAFORMA_FALLO',
          'usuario',
          'FALLO',
        ),
      );
      throw new UnauthorizedException('CREDENCIALES_INVALIDAS');
    }

    if (credencial.bloqueadoHasta && credencial.bloqueadoHasta > new Date()) {
      await this.hashClave.verificar(credencial.hashClave, entrada.clave);
      await this.auditoria.registrar(
        new EventoAuditoria(
          randomUUID(),
          canalAcceso === 'INSTITUCION' ? 'LOGIN_INSTITUCIONAL_FALLO' : 'LOGIN_PLATAFORMA_FALLO',
          'usuario',
          'FALLO',
        ),
      );
      throw new UnauthorizedException('CREDENCIALES_INVALIDAS');
    }

    const valida = await this.hashClave.verificar(
      credencial.hashClave,
      entrada.clave,
    );

    if (!valida) {
      const nuevosIntentos = credencial.intentosFallidos + 1;
      let bloqueadoHasta: Date | null = null;
      if (nuevosIntentos >= 10) {
        bloqueadoHasta = new Date(Date.now() + 60 * 60 * 1000);
      } else if (nuevosIntentos >= 5) {
        bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000);
      }
      await this.credenciales.actualizarIntentosFallidos(
        usuario.id,
        nuevosIntentos,
        bloqueadoHasta,
      );
      await this.auditoria.registrar(
        new EventoAuditoria(
          randomUUID(),
          canalAcceso === 'INSTITUCION' ? 'LOGIN_INSTITUCIONAL_FALLO' : 'LOGIN_PLATAFORMA_FALLO',
          'usuario',
          'FALLO',
        ),
      );
      throw new UnauthorizedException('CREDENCIALES_INVALIDAS');
    }

    // Validación de membresía del usuario en la institución (para acceso institucional)
    if (entrada.acceso) {
      if (canalAcceso === 'INSTITUCION') {
        const queryMembresia = `
          SELECT id FROM membresias_institucion
          WHERE id_usuario = $1 AND id_institucion_educativa = $2 AND estado = 'ACTIVA'
        `;
        const membresias = await this.dataSource.query(queryMembresia, [usuario.id, institucionAccesoId]);
        if (!membresias || membresias.length === 0) {
          await this.auditoria.registrar(
            new EventoAuditoria(randomUUID(), 'LOGIN_INSTITUCIONAL_FALLO', 'usuario', 'FALLO'),
          );
          throw new UnauthorizedException('CREDENCIALES_INVALIDAS');
        }
      } else {
        // Para acceso a plataforma, debe tener asignado al menos un rol de ámbito PLATAFORMA
        const queryPlataforma = `
          SELECT a.id FROM asignaciones_rol_usuario a
          JOIN roles r ON a.id_rol = r.id
          WHERE a.id_usuario = $1 AND r.ambito = 'PLATAFORMA' AND a.estado = 'ACTIVA'
        `;
        const asignacionesPlat = await this.dataSource.query(queryPlataforma, [usuario.id]);
        if (!asignacionesPlat || asignacionesPlat.length === 0) {
          await this.auditoria.registrar(
            new EventoAuditoria(randomUUID(), 'LOGIN_PLATAFORMA_FALLO', 'usuario', 'FALLO'),
          );
          throw new UnauthorizedException('CREDENCIALES_INVALIDAS');
        }
      }
    }

    await this.credenciales.actualizarIntentosFallidos(usuario.id, 0, null);

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
      canalAcceso,
      institucionAccesoId,
      puntoAccesoId,
    };
    const accessToken = this.tokenAcceso.firmar(
      payload,
      this.jwtAccesoTtlSegundos,
    );

    await this.usuarios.actualizarUltimoAcceso(usuario.id, new Date());
    await this.auditoria.registrar(
      new EventoAuditoria(
        randomUUID(),
        canalAcceso === 'INSTITUCION' ? 'LOGIN_INSTITUCIONAL_EXITO' : 'LOGIN_PLATAFORMA_EXITO',
        'usuario',
        'EXITO',
      ),
    );

    return {
      usuarioId: usuario.id,
      nombreMostrado: usuario.nombreMostrado,
      correo: usuario.correo.valor,
      requiereCambioClave: credencial.requiereCambio,
      accessToken,
      refreshToken: refresh.token,
    };
  }
}
