import { Module } from '@nestjs/common';
import { IniciarSesionCasoUso } from './aplicacion/autenticacion/iniciar-sesion.caso-uso';
import { ListarContextosUsuarioConsulta } from './aplicacion/consultas/contexto-acceso';
import {
  REPOSITORIO_AUDITORIA,
  REPOSITORIO_USUARIOS,
} from './dominio/puertos/indice';
import {
  RepositorioAuditoria,
  RepositorioUsuarios,
} from './dominio/puertos/repositorios';
import { AutenticacionControlador } from './presentacion/http/controladores/autenticacion.controlador';

class UsuarioMemoryRepositorio implements RepositorioUsuarios {
  buscarPorCorreoNormalizado() {
    return Promise.resolve(null);
  }
}

class AuditoriaMemoryRepositorio implements RepositorioAuditoria {
  registrar() {
    return Promise.resolve();
  }
}

@Module({
  providers: [
    UsuarioMemoryRepositorio,
    AuditoriaMemoryRepositorio,
    {
      provide: REPOSITORIO_USUARIOS,
      useExisting: UsuarioMemoryRepositorio,
    },
    {
      provide: REPOSITORIO_AUDITORIA,
      useExisting: AuditoriaMemoryRepositorio,
    },
    {
      provide: IniciarSesionCasoUso,
      useFactory: (
        usuarios: RepositorioUsuarios,
        auditoria: RepositorioAuditoria,
      ) => new IniciarSesionCasoUso(usuarios, auditoria),
      inject: [REPOSITORIO_USUARIOS, REPOSITORIO_AUDITORIA],
    },
    ListarContextosUsuarioConsulta,
  ],
  controllers: [AutenticacionControlador],
  exports: [IniciarSesionCasoUso, ListarContextosUsuarioConsulta],
})
export class IdentidadAccesoModule {}
