import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CerrarSesionCasoUso } from './aplicacion/autenticacion/cerrar-sesion.caso-uso';
import { CerrarTodasSesionesCasoUso } from './aplicacion/autenticacion/cerrar-todas-sesiones.caso-uso';
import { IniciarSesionCasoUso } from './aplicacion/autenticacion/iniciar-sesion.caso-uso';
import { RenovarSesionCasoUso } from './aplicacion/autenticacion/renovar-sesion.caso-uso';
import { ListarContextosUsuarioConsulta } from './aplicacion/consultas/contexto-acceso';
import { SeleccionarContextoCasoUso } from './aplicacion/autenticacion/seleccionar-contexto.caso-uso';
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
import { GuardiaJwt } from './presentacion/http/guardias/guardia-jwt';
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
import { ConfiguracionAplicacion } from '../../configuracion/configuracion-aplicacion';

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
    JwtModule.registerAsync({
      inject: [ConfiguracionAplicacion],
      useFactory: (configuracion: ConfiguracionAplicacion) => ({
        secret: configuracion.jwtSecreto,
        signOptions: {
          issuer: configuracion.jwtEmisor,
          audience: configuracion.jwtAudiencia,
        },
      }),
    }),
  ],
  providers: [
    UsuarioTypeormRepositorio,
    CredencialTypeormRepositorio,
    AuditoriaTypeormRepositorio,
    SesionTypeormRepositorio,
    ServicioHashClaveArgon2,
    {
      provide: ServicioTokenAccesoJwt,
      useFactory: (jwt: JwtService, configuracion: ConfiguracionAplicacion) =>
        new ServicioTokenAccesoJwt(
          jwt,
          configuracion.jwtEmisor,
          configuracion.jwtAudiencia,
        ),
      inject: [JwtService, ConfiguracionAplicacion],
    },
    {
      provide: ServicioTokenOpacoCriptografico,
      useFactory: (configuracion: ConfiguracionAplicacion) =>
        new ServicioTokenOpacoCriptografico(configuracion.hashTokenSecreto),
      inject: [ConfiguracionAplicacion],
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
        sesiones: RepositorioSesiones,
        auditoria: RepositorioAuditoria,
        hashClave: ServicioHashClaveArgon2,
        tokenAcceso: ServicioTokenAccesoJwt,
        tokenRefresh: ServicioTokenOpacoCriptografico,
        configuracion: ConfiguracionAplicacion,
      ) =>
        new IniciarSesionCasoUso(
          usuarios,
          credenciales,
          sesiones,
          auditoria,
          hashClave,
          tokenAcceso,
          tokenRefresh,
          configuracion.jwtAccesoTtlSegundos,
          configuracion.tokenRefreshTtlSegundos,
        ),
      inject: [
        REPOSITORIO_USUARIOS,
        REPOSITORIO_CREDENCIALES,
        REPOSITORIO_SESIONES,
        REPOSITORIO_AUDITORIA,
        ServicioHashClaveArgon2,
        ServicioTokenAccesoJwt,
        ServicioTokenOpacoCriptografico,
        ConfiguracionAplicacion,
      ],
    },
    {
      provide: RenovarSesionCasoUso,
      useFactory: (
        sesiones: RepositorioSesiones,
        usuarios: RepositorioUsuarios,
        auditoria: RepositorioAuditoria,
        tokenRefresh: ServicioTokenOpacoCriptografico,
        tokenAcceso: ServicioTokenAccesoJwt,
        configuracion: ConfiguracionAplicacion,
      ) =>
        new RenovarSesionCasoUso(
          sesiones,
          usuarios,
          auditoria,
          tokenRefresh,
          tokenAcceso,
          configuracion.jwtAccesoTtlSegundos,
          configuracion.tokenRefreshTtlSegundos,
        ),
      inject: [
        REPOSITORIO_SESIONES,
        REPOSITORIO_USUARIOS,
        REPOSITORIO_AUDITORIA,
        ServicioTokenOpacoCriptografico,
        ServicioTokenAccesoJwt,
        ConfiguracionAplicacion,
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
    {
      provide: SeleccionarContextoCasoUso,
      useFactory: (
        consultador: ConsultadorContextosAcceso,
        auditoria: RepositorioAuditoria,
        tokenAcceso: ServicioTokenAccesoJwt,
        configuracion: ConfiguracionAplicacion,
      ) =>
        new SeleccionarContextoCasoUso(
          consultador,
          auditoria,
          tokenAcceso,
          configuracion.jwtAccesoTtlSegundos,
        ),
      inject: [
        CONSULTADOR_CONTEXTOS,
        REPOSITORIO_AUDITORIA,
        ServicioTokenAccesoJwt,
        ConfiguracionAplicacion,
      ],
    },
    {
      provide: GuardiaJwt,
      useFactory: (
        reflector: Reflector,
        tokenAcceso: ServicioTokenAccesoJwt,
        sesiones: RepositorioSesiones,
        usuarios: RepositorioUsuarios,
      ) => new GuardiaJwt(reflector, tokenAcceso, sesiones, usuarios),
      inject: [
        Reflector,
        ServicioTokenAccesoJwt,
        REPOSITORIO_SESIONES,
        REPOSITORIO_USUARIOS,
      ],
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
    SeleccionarContextoCasoUso,
    ListarContextosUsuarioConsulta,
    ServicioTokenAccesoJwt,
    GuardiaJwt,
    REPOSITORIO_SESIONES,
    REPOSITORIO_USUARIOS,
  ],
})
export class IdentidadAccesoModule {}
