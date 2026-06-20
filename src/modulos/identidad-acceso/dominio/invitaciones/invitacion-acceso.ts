export type EstadoInvitacion =
  | 'PENDIENTE'
  | 'ACEPTADA'
  | 'EXPIRADA'
  | 'REVOCADA';

export class InvitacionAcceso {
  constructor(
    readonly id: string,
    readonly institucionId: string,
    readonly correoNormalizado: string,
    readonly tokenHash: string,
    readonly estado: EstadoInvitacion = 'PENDIENTE',
  ) {}
}
