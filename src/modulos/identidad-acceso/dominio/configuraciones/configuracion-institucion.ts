export class ConfiguracionInstitucion {
  constructor(
    readonly institucionId: string,
    readonly zonaHoraria: string = 'America/Lima',
    readonly idioma: string = 'es-PE',
    readonly moneda: string = 'PEN',
    readonly version: number = 1,
  ) {}
}
