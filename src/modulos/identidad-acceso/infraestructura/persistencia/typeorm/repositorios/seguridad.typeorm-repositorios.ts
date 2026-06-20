import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoAuditoria } from '../../../../dominio/auditoria/evento-auditoria';
import { ConfiguracionInstitucion } from '../../../../dominio/configuraciones/configuracion-institucion';
import { InvitacionAcceso } from '../../../../dominio/invitaciones/invitacion-acceso';
import { MembresiaInstitucion } from '../../../../dominio/membresias/membresia-institucion';
import { Rol } from '../../../../dominio/roles/rol';
import { SesionUsuario } from '../../../../dominio/sesiones/sesion-usuario';
import { HashClave } from '../../../../dominio/valores/hash-clave';
import {
  RepositorioAuditoria,
  RepositorioConfiguraciones,
  RepositorioCredenciales,
  RepositorioInvitaciones,
  RepositorioMembresias,
  RepositorioRoles,
  RepositorioSesiones,
  RepositorioUsuarios,
} from '../../../../dominio/puertos/repositorios';
import { Usuario } from '../../../../dominio/usuarios/usuario';
import { CorreoElectronico } from '../../../../dominio/valores/correo-electronico';
import {
  ConfiguracionInstitucionTypeormEntidad,
  CredencialUsuarioTypeormEntidad,
  EventoAuditoriaTypeormEntidad,
  InvitacionAccesoTypeormEntidad,
  MembresiaInstitucionTypeormEntidad,
  RolTypeormEntidad,
  SesionUsuarioTypeormEntidad,
  UsuarioTypeormEntidad,
} from '../entidades/seguridad.typeorm-entidades';

function toEstadoUsuario(
  estado: string,
): 'PENDIENTE' | 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO' | 'BAJA' {
  return estado === 'ACTIVO' ||
    estado === 'INACTIVO' ||
    estado === 'BLOQUEADO' ||
    estado === 'BAJA'
    ? estado
    : 'PENDIENTE';
}

function toEstadoMembresia(
  estado: string,
): 'PENDIENTE' | 'ACTIVA' | 'SUSPENDIDA' | 'INACTIVA' | 'BAJA' {
  return estado === 'ACTIVA' ||
    estado === 'SUSPENDIDA' ||
    estado === 'INACTIVA' ||
    estado === 'BAJA'
    ? estado
    : 'PENDIENTE';
}

function toAmbitoRol(ambito: string): 'PLATAFORMA' | 'INSTITUCION' | 'SEDE' {
  return ambito === 'PLATAFORMA' ||
    ambito === 'INSTITUCION' ||
    ambito === 'SEDE'
    ? ambito
    : 'PLATAFORMA';
}

function toEstadoInvitacion(
  estado: string,
): 'PENDIENTE' | 'ACEPTADA' | 'EXPIRADA' | 'REVOCADA' {
  return estado === 'ACEPTADA' || estado === 'EXPIRADA' || estado === 'REVOCADA'
    ? estado
    : 'PENDIENTE';
}

@Injectable()
export class UsuarioTypeormRepositorio implements RepositorioUsuarios {
  constructor(
    @InjectRepository(UsuarioTypeormEntidad)
    private readonly repositorio: Repository<UsuarioTypeormEntidad>,
  ) {}
  async buscarPorId(usuarioId: string): Promise<Usuario | null> {
    const entidad = await this.repositorio.findOne({
      where: { id: usuarioId },
    });
    return entidad
      ? new Usuario(
          entidad.id,
          CorreoElectronico.crear(entidad.correoNormalizado),
          entidad.nombreMostrado,
          toEstadoUsuario(entidad.estado),
          entidad.correoVerificado,
          entidad.versionSeguridad,
        )
      : null;
  }
  async buscarPorCorreoNormalizado(
    correoNormalizado: string,
  ): Promise<Usuario | null> {
    const entidad = await this.repositorio.findOne({
      where: { correoNormalizado },
    });
    return entidad
      ? new Usuario(
          entidad.id,
          CorreoElectronico.crear(entidad.correoNormalizado),
          entidad.nombreMostrado,
          toEstadoUsuario(entidad.estado),
          entidad.correoVerificado,
          entidad.versionSeguridad,
        )
      : null;
  }
  async actualizarUltimoAcceso(usuarioId: string, fecha: Date): Promise<void> {
    await this.repositorio.update({ id: usuarioId }, { ultimoAcceso: fecha });
  }
  async incrementarVersionSeguridad(usuarioId: string): Promise<void> {
    await this.repositorio.increment({ id: usuarioId }, 'versionSeguridad', 1);
  }
}

@Injectable()
export class CredencialTypeormRepositorio implements RepositorioCredenciales {
  constructor(
    @InjectRepository(CredencialUsuarioTypeormEntidad)
    private readonly repositorio: Repository<CredencialUsuarioTypeormEntidad>,
  ) {}
  async obtenerHashPorUsuario(usuarioId: string): Promise<HashClave | null> {
    const entidad = await this.repositorio.findOne({
      where: { idUsuario: usuarioId },
    });
    return entidad ? HashClave.crear(entidad.hashClave) : null;
  }
  async actualizarIntentosFallidos(
    usuarioId: string,
    intentosFallidos: number,
    bloqueadoHasta: Date | null,
  ): Promise<void> {
    await this.repositorio.update(
      { idUsuario: usuarioId },
      { intentosFallidos, bloqueadoHasta },
    );
  }
  async actualizarClave(
    usuarioId: string,
    hashClave: string,
    requiereCambio: boolean,
  ): Promise<void> {
    await this.repositorio.update(
      { idUsuario: usuarioId },
      {
        hashClave,
        requiereCambio,
        fechaCambioClave: new Date(),
      },
    );
  }
}

@Injectable()
export class MembresiaTypeormRepositorio implements RepositorioMembresias {
  constructor(
    @InjectRepository(MembresiaInstitucionTypeormEntidad)
    private readonly repositorio: Repository<MembresiaInstitucionTypeormEntidad>,
  ) {}
  async buscarActivaPorUsuarioEInstitucion(
    usuarioId: string,
    institucionId: string,
  ): Promise<MembresiaInstitucion | null> {
    const entidad = await this.repositorio.findOne({
      where: {
        usuarioId,
        institucionEducativaId: institucionId,
        estado: 'ACTIVA',
      },
    });
    return entidad
      ? new MembresiaInstitucion(
          entidad.id,
          entidad.usuarioId,
          entidad.institucionEducativaId,
          toEstadoMembresia(entidad.estado),
        )
      : null;
  }
  async listarActivasPorUsuario(
    usuarioId: string,
  ): Promise<MembresiaInstitucion[]> {
    const entidades = await this.repositorio.find({
      where: { usuarioId, estado: 'ACTIVA' },
    });
    return entidades.map(
      (entidad) =>
        new MembresiaInstitucion(
          entidad.id,
          entidad.usuarioId,
          entidad.institucionEducativaId,
          toEstadoMembresia(entidad.estado),
        ),
    );
  }
}

@Injectable()
export class RolTypeormRepositorio implements RepositorioRoles {
  constructor(
    @InjectRepository(RolTypeormEntidad)
    private readonly repositorio: Repository<RolTypeormEntidad>,
  ) {}
  async listarActivos(): Promise<Rol[]> {
    const roles = await this.repositorio.find({ where: { activo: true } });
    return roles.map(
      (rol) =>
        new Rol(
          rol.id,
          rol.codigo,
          rol.nombre,
          toAmbitoRol(rol.ambito),
          rol.activo,
        ),
    );
  }
  async obtenerPorCodigo(codigo: string): Promise<Rol | null> {
    const rol = await this.repositorio.findOne({ where: { codigo } });
    return rol
      ? new Rol(
          rol.id,
          rol.codigo,
          rol.nombre,
          toAmbitoRol(rol.ambito),
          rol.activo,
        )
      : null;
  }
}

@Injectable()
export class SesionTypeormRepositorio implements RepositorioSesiones {
  constructor(
    @InjectRepository(SesionUsuarioTypeormEntidad)
    private readonly repositorio: Repository<SesionUsuarioTypeormEntidad>,
  ) {}
  async crear(sesion: SesionUsuario): Promise<SesionUsuario> {
    await this.repositorio.save(
      this.repositorio.create({
        id: sesion.id,
        usuarioId: sesion.usuarioId,
        sesionAnteriorId: sesion.sesionAnteriorId,
        identificadorFamilia: sesion.familiaId,
        tokenActualizacionHash: sesion.tokenActualizacionHash,
        fechaExpiracion:
          sesion.fechaExpiracion ?? new Date(Date.now() + 15 * 60 * 1000),
      }),
    );
    return sesion;
  }
  async buscarPorId(sesionId: string): Promise<SesionUsuario | null> {
    const entidad = await this.repositorio.findOne({ where: { id: sesionId } });
    return entidad
      ? new SesionUsuario(
          entidad.id,
          entidad.usuarioId,
          entidad.identificadorFamilia,
          entidad.tokenActualizacionHash,
          entidad.sesionAnteriorId,
          entidad.fechaExpiracion,
          entidad.fechaRevocacion,
        )
      : null;
  }
  async buscarPorHashRefresh(
    tokenActualizacionHash: string,
  ): Promise<SesionUsuario | null> {
    const entidad = await this.repositorio.findOne({
      where: { tokenActualizacionHash },
    });
    return entidad
      ? new SesionUsuario(
          entidad.id,
          entidad.usuarioId,
          entidad.identificadorFamilia,
          entidad.tokenActualizacionHash,
          entidad.sesionAnteriorId,
          entidad.fechaExpiracion,
          entidad.fechaRevocacion,
        )
      : null;
  }
  async revocar(sesionId: string, motivo: string, fecha: Date): Promise<void> {
    await this.repositorio.update(
      { id: sesionId },
      { fechaRevocacion: fecha, motivoRevocacion: motivo },
    );
  }
  async revocarFamilia(
    identificadorFamilia: string,
    motivo: string,
    fecha: Date,
  ): Promise<void> {
    await this.repositorio.update(
      { identificadorFamilia },
      { fechaRevocacion: fecha, motivoRevocacion: motivo },
    );
  }
  async revocarPorUsuario(
    usuarioId: string,
    motivo: string,
    fecha: Date,
  ): Promise<void> {
    await this.repositorio.update(
      { usuarioId },
      { fechaRevocacion: fecha, motivoRevocacion: motivo },
    );
  }
}

@Injectable()
export class AuditoriaTypeormRepositorio implements RepositorioAuditoria {
  constructor(
    @InjectRepository(EventoAuditoriaTypeormEntidad)
    private readonly repositorio: Repository<EventoAuditoriaTypeormEntidad>,
  ) {}
  async registrar(evento: EventoAuditoria): Promise<void> {
    await this.repositorio.save(
      this.repositorio.create({
        id: evento.id,
        accion: evento.accion,
        recurso: evento.recurso,
        resultado: evento.resultado,
        idCorrelacion: evento.id,
      }),
    );
  }
}

@Injectable()
export class ConfiguracionInstitucionTypeormRepositorio implements RepositorioConfiguraciones {
  constructor(
    @InjectRepository(ConfiguracionInstitucionTypeormEntidad)
    private readonly repositorio: Repository<ConfiguracionInstitucionTypeormEntidad>,
  ) {}
  async obtenerPorInstitucion(
    institucionId: string,
  ): Promise<ConfiguracionInstitucion | null> {
    const entidad = await this.repositorio.findOne({
      where: { institucionEducativaId: institucionId },
    });
    return entidad
      ? new ConfiguracionInstitucion(
          entidad.institucionEducativaId,
          entidad.zonaHoraria,
          entidad.idioma,
          entidad.moneda,
          entidad.version,
        )
      : null;
  }
  async actualizar(configuracion: ConfiguracionInstitucion): Promise<void> {
    await this.repositorio.update(
      { institucionEducativaId: configuracion.institucionId },
      {
        zonaHoraria: configuracion.zonaHoraria,
        idioma: configuracion.idioma,
        moneda: configuracion.moneda,
        version: configuracion.version,
      },
    );
  }
}

@Injectable()
export class InvitacionTypeormRepositorio implements RepositorioInvitaciones {
  constructor(
    @InjectRepository(InvitacionAccesoTypeormEntidad)
    private readonly repositorio: Repository<InvitacionAccesoTypeormEntidad>,
  ) {}
  async buscarPorTokenHash(
    tokenHash: string,
  ): Promise<InvitacionAcceso | null> {
    const entidad = await this.repositorio.findOne({ where: { tokenHash } });
    return entidad
      ? new InvitacionAcceso(
          entidad.id,
          entidad.institucionEducativaId,
          entidad.correoNormalizado,
          entidad.tokenHash,
          toEstadoInvitacion(entidad.estado),
        )
      : null;
  }
}
