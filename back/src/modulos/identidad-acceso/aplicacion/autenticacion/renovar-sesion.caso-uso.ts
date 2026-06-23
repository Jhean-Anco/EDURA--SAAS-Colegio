import { randomUUID } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
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
import {
  SesionUsuarioTypeormEntidad,
  UsuarioTypeormEntidad,
  EventoAuditoriaTypeormEntidad,
} from '../../infraestructura/persistencia/typeorm/entidades/seguridad.typeorm-entidades';

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
    private readonly dataSource: DataSource,
  ) {}

  async ejecutar(entrada: RenovarSesionEntrada): Promise<RenovarSesionSalida> {
    const hash = this.tokenRefresh.hash(entrada.refreshToken);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the session with FOR UPDATE to prevent race conditions & concurrent renewals
      const sesionEntidad = await queryRunner.manager.findOne(
        SesionUsuarioTypeormEntidad,
        {
          where: { tokenActualizacionHash: hash },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!sesionEntidad) {
        const auditEvent = queryRunner.manager.create(
          EventoAuditoriaTypeormEntidad,
          {
            id: randomUUID(),
            accion: 'REFRESH_INVALIDO',
            recurso: 'sesion',
            resultado: 'FALLO',
            idCorrelacion: randomUUID(),
          },
        );
        await queryRunner.manager.save(
          EventoAuditoriaTypeormEntidad,
          auditEvent,
        );
        await queryRunner.commitTransaction();
        throw new UnauthorizedException('SESION_INVALIDA');
      }

      // Reuse detection: if the session has already been revoked, revoke the entire family!
      if (sesionEntidad.fechaRevocacion !== null) {
        await queryRunner.manager.update(
          SesionUsuarioTypeormEntidad,
          { identificadorFamilia: sesionEntidad.identificadorFamilia },
          {
            fechaRevocacion: new Date(),
            motivoRevocacion: 'REUSE_DETECTED',
          },
        );

        const auditEvent = queryRunner.manager.create(
          EventoAuditoriaTypeormEntidad,
          {
            id: randomUUID(),
            accion: 'REFRESH_REINTEGRO_DETECTOR_REUSO',
            recurso: 'sesion',
            recursoId: sesionEntidad.id,
            usuarioId: sesionEntidad.usuarioId,
            resultado: 'FALLO',
            idCorrelacion: randomUUID(),
            metadatos: { familiaId: sesionEntidad.identificadorFamilia },
          },
        );
        await queryRunner.manager.save(
          EventoAuditoriaTypeormEntidad,
          auditEvent,
        );
        await queryRunner.commitTransaction();
        throw new UnauthorizedException('SESION_INVALIDA');
      }

      // Check expiration
      if (sesionEntidad.fechaExpiracion < new Date()) {
        await queryRunner.manager.update(
          SesionUsuarioTypeormEntidad,
          { id: sesionEntidad.id },
          {
            fechaRevocacion: new Date(),
            motivoRevocacion: 'EXPIRADA',
          },
        );

        const auditEvent = queryRunner.manager.create(
          EventoAuditoriaTypeormEntidad,
          {
            id: randomUUID(),
            accion: 'REFRESH_EXPIRADO',
            recurso: 'sesion',
            recursoId: sesionEntidad.id,
            usuarioId: sesionEntidad.usuarioId,
            resultado: 'FALLO',
            idCorrelacion: randomUUID(),
          },
        );
        await queryRunner.manager.save(
          EventoAuditoriaTypeormEntidad,
          auditEvent,
        );
        await queryRunner.commitTransaction();
        throw new UnauthorizedException('SESION_INVALIDA');
      }

      // Check user
      const usuario = await queryRunner.manager.findOne(UsuarioTypeormEntidad, {
        where: { id: sesionEntidad.usuarioId },
      });

      if (!usuario || usuario.estado !== 'ACTIVO') {
        const auditEvent = queryRunner.manager.create(
          EventoAuditoriaTypeormEntidad,
          {
            id: randomUUID(),
            accion: 'REFRESH_USUARIO_INACTIVO',
            recurso: 'sesion',
            recursoId: sesionEntidad.id,
            usuarioId: sesionEntidad.usuarioId,
            resultado: 'FALLO',
            idCorrelacion: randomUUID(),
          },
        );
        await queryRunner.manager.save(
          EventoAuditoriaTypeormEntidad,
          auditEvent,
        );
        await queryRunner.commitTransaction();
        throw new UnauthorizedException('USUARIO_INACTIVO');
      }

      const nuevoRefresh = this.tokenRefresh.generar();
      const expiracion = new Date(
        Date.now() + this.tokenRefreshTtlSegundos * 1000,
      );
      const nuevaSesionId = randomUUID();

      // Revoke the old rotated session
      await queryRunner.manager.update(
        SesionUsuarioTypeormEntidad,
        { id: sesionEntidad.id },
        {
          fechaRevocacion: new Date(),
          motivoRevocacion: 'ROTADA',
        },
      );

      // Create new session
      const nuevaSesion = queryRunner.manager.create(
        SesionUsuarioTypeormEntidad,
        {
          id: nuevaSesionId,
          usuarioId: sesionEntidad.usuarioId,
          sesionAnteriorId: sesionEntidad.id,
          identificadorFamilia: sesionEntidad.identificadorFamilia,
          tokenActualizacionHash: nuevoRefresh.hash,
          fechaExpiracion: expiracion,
        },
      );
      await queryRunner.manager.save(SesionUsuarioTypeormEntidad, nuevaSesion);

      const correlationId = randomUUID();
      const auditEvent = queryRunner.manager.create(
        EventoAuditoriaTypeormEntidad,
        {
          id: randomUUID(),
          accion: 'SESION_RENOVADA',
          recurso: 'sesion',
          recursoId: nuevaSesionId,
          usuarioId: sesionEntidad.usuarioId,
          resultado: 'EXITO',
          idCorrelacion: correlationId,
        },
      );
      await queryRunner.manager.save(EventoAuditoriaTypeormEntidad, auditEvent);

      await queryRunner.commitTransaction();

      const accessToken = this.tokenAcceso.firmar(
        {
          sub: sesionEntidad.usuarioId,
          sid: nuevaSesionId,
          versionSeguridad: usuario.versionSeguridad,
          tipoToken: 'PRECONTEXTO',
          ambito: null,
          rolId: null,
          institucionId: null,
          sedeId: null,
        } satisfies PayloadAcceso,
        this.jwtAccesoTtlSegundos,
      );

      return { accessToken, refreshToken: nuevoRefresh.token };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
