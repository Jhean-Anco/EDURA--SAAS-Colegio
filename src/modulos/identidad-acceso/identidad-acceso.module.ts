import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CerrarSesionCasoUso } from './aplicacion/autenticacion/cerrar-sesion.caso-uso';
import { CerrarTodasSesionesCasoUso } from './aplicacion/autenticacion/cerrar-todas-sesiones.caso-uso';
import { IniciarSesionCasoUso } from './aplicacion/autenticacion/iniciar-sesion.caso-uso';
import { RenovarSesionCasoUso } from './aplicacion/autenticacion/renovar-sesion.caso-uso';
import { ListarContextosUsuarioConsulta } from './aplicacion/consultas/contexto-acceso';
import {
  CONSULTADOR_CONTEXTOS,
  REPOSITORIO_AUDITORIA,
  REPOSITORIO_CREDENCIALES,
  REPOSITORIO_SESIONES,
  REPOSITORIO_USUARIOS,
} from './dominio/puertos/indice';
import {
  ConsultadorContextosAcceso,
  RepositorioAuditoria,
  RepositorioCredenciales,
  RepositorioSesiones,
  RepositorioUsuarios,
} from './dominio/puertos/repositorios';
import { AutenticacionControlador } from './presentacion/http/controladores/autenticacion.controlador';
import {
  AuditoriaTypeormRepositorio,
  CredencialTypeormRepositorio,
  SesionTypeormRepositorio,
  UsuarioTypeormRepositorio,
} from './infraestructura/persistencia/typeorm/repositorios/seguridad.typeorm-repositorios';
import {
  AsignacionRolUsuarioTypeormEntidad,
  CredencialUsuarioTypeormEntidad,
  EventoAuditoriaTypeormEntidad,
  InvitacionAccesoTypeormEntidad,
  MembresiaInstitucionTypeormEntidad,
  RolTypeormEntidad,
  SesionUsuarioTypeormEntidad,
  UsuarioTypeormEntidad,
} from './infraestructura/persistencia/typeorm/entidades/seguridad.typeorm-entidades';
import { ServicioHashClaveArgon2 } from './infraestructura/criptografia/servicio-hash-clave-argon2';
import { ServicioTokenAccesoJwt } from './infraestructura/tokens/servicio-token-acceso-jwt';
import { ServicioTokenOpacoCriptografico } from './infraestructura/tokens/servicio-token-opaco';
import { ContextoAccesoTypeormConsulta } from './infraestructura/persistencia/typeorm/consultas/contexto-acceso.typeorm-consulta';
import { InstitucionEducativaTypeormEntidad } from '../estructura-institucional/infraestructura/persistencia/typeorm/entidades/institucion-educativa.typeorm-entidad';
import { SedeTypeormEntidad } from '../estructura-institucional/infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioTypeormEntidad,
      CredencialUsuarioTypeormEntidad,
      EventoAuditoriaTypeormEntidad,
      MembresiaInstitucionTypeormEntidad,
      RolTypeormEntidad,
      SesionUsuarioTypeormEntidad,
      InvitacionAccesoTypeormEntidad,
      AsignacionRolUsuarioTypeormEntidad,
      InstitucionEducativaTypeormEntidad,
      SedeTypeormEntidad,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRETO ?? 'dev-secret',
      signOptions: {
        issuer: process.env.JWT_EMISOR ?? 'EDURA',
        audience: process.env.JWT_AUDIENCIA ?? 'EDURA_WEB',
      },
    }),
  ],
  providers: [
    UsuarioTypeormRepositorio,
    CredencialTypeormRepositorio,
    AuditoriaTypeormRepositorio,
    SesionTypeormRepositorio,
    ServicioHashClaveArgon2,
    JwtService,
    {
      provide: ServicioTokenAccesoJwt,
      useFactory: (jwt: JwtService) =>
        new ServicioTokenAccesoJwt(
          jwt,
          process.env.JWT_EMISOR ?? 'EDURA',
          process.env.JWT_AUDIENCIA ?? 'EDURA_WEB',
        ),
      inject: [JwtService],
    },
    {
      provide: ServicioTokenOpacoCriptografico,
      useFactory: () =>
        new ServicioTokenOpacoCriptografico(
          process.env.HASH_TOKEN_SECRETO ?? 'dev-secret-token',
        ),
    },
    {
      provide: REPOSITORIO_USUARIOS,
      useExisting: UsuarioTypeormRepositorio,
    },
    {
      provide: REPOSITORIO_CREDENCIALES,
      useExisting: CredencialTypeormRepositorio,
    },
    {
      provide: REPOSITORIO_AUDITORIA,
      useExisting: AuditoriaTypeormRepositorio,
    },
    {
      provide: REPOSITORIO_SESIONES,
      useExisting: SesionTypeormRepositorio,
    },
    {
      provide: IniciarSesionCasoUso,
      useFactory: (
        usuarios: RepositorioUsuarios,
        credenciales: RepositorioCredenciales,
        auditoria: RepositorioAuditoria,
        hashClave: ServicioHashClaveArgon2,
        tokenAcceso: ServicioTokenAccesoJwt,
        tokenRefresh: ServicioTokenOpacoCriptografico,
      ) =>
        new IniciarSesionCasoUso(
          usuarios,
          credenciales,
          auditoria,
          hashClave,
          tokenAcceso,
          tokenRefresh,
        ),
      inject: [
        REPOSITORIO_USUARIOS,
        REPOSITORIO_CREDENCIALES,
        REPOSITORIO_AUDITORIA,
        ServicioHashClaveArgon2,
        ServicioTokenAccesoJwt,
        ServicioTokenOpacoCriptografico,
      ],
    },
    {
      provide: RenovarSesionCasoUso,
      useFactory: (
        sesiones: RepositorioSesiones,
        auditoria: RepositorioAuditoria,
        tokenRefresh: ServicioTokenOpacoCriptografico,
        tokenAcceso: ServicioTokenAccesoJwt,
      ) =>
        new RenovarSesionCasoUso(
          sesiones,
          auditoria,
          tokenRefresh,
          tokenAcceso,
        ),
      inject: [
        REPOSITORIO_SESIONES,
        REPOSITORIO_AUDITORIA,
        ServicioTokenOpacoCriptografico,
        ServicioTokenAccesoJwt,
      ],
    },
    {
      provide: CerrarSesionCasoUso,
      useFactory: (
        sesiones: RepositorioSesiones,
        auditoria: RepositorioAuditoria,
      ) => new CerrarSesionCasoUso(sesiones, auditoria),
      inject: [REPOSITORIO_SESIONES, REPOSITORIO_AUDITORIA],
    },
    {
      provide: CerrarTodasSesionesCasoUso,
      useFactory: (
        sesiones: RepositorioSesiones,
        auditoria: RepositorioAuditoria,
      ) => new CerrarTodasSesionesCasoUso(sesiones, auditoria),
      inject: [REPOSITORIO_SESIONES, REPOSITORIO_AUDITORIA],
    },
    ContextoAccesoTypeormConsulta,
    {
      provide: CONSULTADOR_CONTEXTOS,
      useExisting: ContextoAccesoTypeormConsulta,
    },
    {
      provide: ListarContextosUsuarioConsulta,
      useFactory: (consultador: ConsultadorContextosAcceso) =>
        new ListarContextosUsuarioConsulta(consultador),
      inject: [CONSULTADOR_CONTEXTOS],
    },
  ],
  controllers: [AutenticacionControlador],
  exports: [
    IniciarSesionCasoUso,
    RenovarSesionCasoUso,
    CerrarSesionCasoUso,
    CerrarTodasSesionesCasoUso,
    ListarContextosUsuarioConsulta,
  ],
})
export class IdentidadAccesoModule {}
