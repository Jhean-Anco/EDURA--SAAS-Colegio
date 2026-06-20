import { Usuario } from '../usuarios/usuario';
import { MembresiaInstitucion } from '../membresias/membresia-institucion';
import { Rol } from '../roles/rol';
import { SesionUsuario } from '../sesiones/sesion-usuario';
import { InvitacionAcceso } from '../invitaciones/invitacion-acceso';
import { EventoAuditoria } from '../auditoria/evento-auditoria';
import { ConfiguracionInstitucion } from '../configuraciones/configuracion-institucion';

export interface RepositorioUsuarios {
  buscarPorCorreoNormalizado(
    correoNormalizado: string,
  ): Promise<Usuario | null>;
}

export interface RepositorioMembresias {
  buscarActivaPorUsuarioEInstitucion(
    usuarioId: string,
    institucionId: string,
  ): Promise<MembresiaInstitucion | null>;
}

export interface RepositorioRoles {
  listarActivos(): Promise<Rol[]>;
}

export interface RepositorioSesiones {
  crear(sesion: SesionUsuario): Promise<SesionUsuario>;
}

export interface RepositorioInvitaciones {
  buscarPorTokenHash(tokenHash: string): Promise<InvitacionAcceso | null>;
}

export interface RepositorioAuditoria {
  registrar(evento: EventoAuditoria): Promise<void>;
}

export interface RepositorioConfiguraciones {
  obtenerPorInstitucion(
    institucionId: string,
  ): Promise<ConfiguracionInstitucion | null>;
}

export interface ServicioCorreo {
  enviarInvitacion(...argumentos: never[]): Promise<void>;
  enviarVerificacion(...argumentos: never[]): Promise<void>;
  enviarRecuperacion(...argumentos: never[]): Promise<void>;
}
