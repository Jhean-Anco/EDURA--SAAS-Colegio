export type EstadoMembresia =
  | 'PENDIENTE'
  | 'ACTIVA'
  | 'SUSPENDIDA'
  | 'INACTIVA'
  | 'BAJA';

export class MembresiaInstitucion {
  constructor(
    readonly id: string,
    readonly usuarioId: string,
    readonly institucionId: string,
    readonly estado: EstadoMembresia = 'PENDIENTE',
  ) {}
}
