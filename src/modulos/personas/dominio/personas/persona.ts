export type EstadoPersona = 'ACTIVA' | 'INACTIVA' | 'BAJA';

export class Persona {
  constructor(
    readonly id: string,
    readonly institucionEducativaId: string,
    readonly nombres: string,
    readonly apellidoPaterno: string | null,
    readonly apellidoMaterno: string | null,
    readonly fechaNacimiento: Date | null,
    readonly sexoRegistral: string | null,
    readonly codigoPaisNacionalidad: string | null,
    readonly estado: EstadoPersona,
    readonly fechaCreacion: Date,
    readonly fechaModificacion: Date,
  ) {}
}
