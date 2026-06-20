import { CorreoElectronico } from '../valores/correo-electronico';

export type EstadoUsuario =
  | 'PENDIENTE'
  | 'ACTIVO'
  | 'INACTIVO'
  | 'BLOQUEADO'
  | 'BAJA';

export class Usuario {
  constructor(
    readonly id: string,
    readonly correo: CorreoElectronico,
    readonly nombreMostrado: string,
    private _estado: EstadoUsuario = 'PENDIENTE',
    readonly correoVerificado = false,
  ) {}

  get estado(): EstadoUsuario {
    return this._estado;
  }
}
