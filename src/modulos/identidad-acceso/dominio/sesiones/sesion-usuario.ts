export class SesionUsuario {
  constructor(
    readonly id: string,
    readonly usuarioId: string,
    readonly familiaId: string,
    readonly tokenActualizacionHash: string,
    readonly sesionAnteriorId: string | null = null,
    readonly fechaExpiracion: Date | null = null,
    readonly fechaRevocacion: Date | null = null,
  ) {}
}
