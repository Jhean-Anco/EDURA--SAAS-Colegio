import { Usuario } from '../../../../dominio/usuarios/usuario';
import { CorreoElectronico } from '../../../../dominio/valores/correo-electronico';
import { UsuarioTypeormEntidad } from '../entidades/seguridad.typeorm-entidades';

function toEstadoUsuario(
  estado: string,
): 'PENDIENTE' | 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO' | 'BAJA' {
  switch (estado) {
    case 'ACTIVO':
    case 'INACTIVO':
    case 'BLOQUEADO':
    case 'BAJA':
    case 'PENDIENTE':
      return estado;
    default:
      return 'PENDIENTE';
  }
}

export class UsuarioTypeormMapeador {
  aDominio(entidad: UsuarioTypeormEntidad): Usuario {
    return new Usuario(
      entidad.id,
      CorreoElectronico.crear(entidad.correoNormalizado),
      entidad.nombreMostrado,
      toEstadoUsuario(entidad.estado),
      entidad.correoVerificado,
      entidad.versionSeguridad,
    );
  }
}
