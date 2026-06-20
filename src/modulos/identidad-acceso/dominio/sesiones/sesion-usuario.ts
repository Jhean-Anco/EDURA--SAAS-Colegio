export class SesionUsuario {
  constructor(
    readonly id: string,
    readonly usuarioId: string,
    readonly familiaId: string,
    readonly tokenActualizacionHash: string,
  ) {}
}
