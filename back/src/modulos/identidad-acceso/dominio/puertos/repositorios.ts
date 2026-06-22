import { Usuario } from '../usuarios/usuario';
import { HashClave } from '../valores/hash-clave';
import { MembresiaInstitucion } from '../membresias/membresia-institucion';
import { Rol } from '../roles/rol';
import { SesionUsuario } from '../sesiones/sesion-usuario';
import { InvitacionAcceso } from '../invitaciones/invitacion-acceso';
import { EventoAuditoria } from '../auditoria/evento-auditoria';
import { ConfiguracionInstitucion } from '../configuraciones/configuracion-institucion';

export interface ContextoAcceso {
  ambito: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';
  rolId: string;
  rolCodigo: string;
  institucionId: string | null;
  institucionNombre: string | null;
  sedeId: string | null;
  sedeNombre: string | null;
}

export interface RepositorioUsuarios {
  buscarPorId(usuarioId: string): Promise<Usuario | null>;
  buscarPorCorreoNormalizado(
    correoNormalizado: string,
  ): Promise<Usuario | null>;
  actualizarUltimoAcceso(usuarioId: string, fecha: Date): Promise<void>;
  incrementarVersionSeguridad(usuarioId: string): Promise<void>;
}

export interface CredencialCompleta {
  hashClave: string;
  intentosFallidos: number;
  bloqueadoHasta: Date | null;
  requiereCambio: boolean;
}

export interface RepositorioCredenciales {
  obtenerHashPorUsuario(usuarioId: string): Promise<HashClave | null>;
  obtenerPorUsuario(usuarioId: string): Promise<CredencialCompleta | null>;
  actualizarIntentosFallidos(
    usuarioId: string,
    intentosFallidos: number,
    bloqueadoHasta: Date | null,
  ): Promise<void>;
  actualizarClave(
    usuarioId: string,
    hashClave: string,
    requiereCambio: boolean,
  ): Promise<void>;
}

export interface RepositorioMembresias {
  buscarActivaPorUsuarioEInstitucion(
    usuarioId: string,
    institucionId: string,
  ): Promise<MembresiaInstitucion | null>;
  listarActivasPorUsuario(usuarioId: string): Promise<MembresiaInstitucion[]>;
}

export interface RepositorioRoles {
  listarActivos(): Promise<Rol[]>;
  obtenerPorCodigo(codigo: string): Promise<Rol | null>;
}

export interface RepositorioSesiones {
  crear(sesion: SesionUsuario): Promise<SesionUsuario>;
  buscarPorId(sesionId: string): Promise<SesionUsuario | null>;
  buscarPorHashRefresh(
    tokenActualizacionHash: string,
  ): Promise<SesionUsuario | null>;
  revocar(sesionId: string, motivo: string, fecha: Date): Promise<void>;
  revocarFamilia(
    identificadorFamilia: string,
    motivo: string,
    fecha: Date,
  ): Promise<void>;
  revocarPorUsuario(
    usuarioId: string,
    motivo: string,
    fecha: Date,
  ): Promise<void>;
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
  actualizar(configuracion: ConfiguracionInstitucion): Promise<void>;
}

export interface ConsultadorContextosAcceso {
  listarPorUsuario(usuarioId: string): Promise<ContextoAcceso[]>;
}

export interface ServicioCorreo {
  enviarInvitacion(entrada: {
    correoDestino: string;
    nombreInstitucion: string;
    urlAceptacion: string;
    fechaExpiracion: Date;
  }): Promise<void>;
  enviarVerificacion(entrada: {
    correoDestino: string;
    urlVerificacion: string;
    fechaExpiracion: Date;
  }): Promise<void>;
  enviarRecuperacion(entrada: {
    correoDestino: string;
    urlRecuperacion: string;
    fechaExpiracion: Date;
  }): Promise<void>;
}
