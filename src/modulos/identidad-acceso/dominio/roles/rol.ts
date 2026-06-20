export type AmbitoRol = 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';

export class Rol {
  constructor(
    readonly id: string,
    readonly codigo: string,
    readonly nombre: string,
    readonly ambito: AmbitoRol,
    readonly activo = true,
  ) {}
}
