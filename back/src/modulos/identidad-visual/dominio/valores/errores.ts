export class IdentidadVisualError extends Error {
  constructor(public readonly codigo: string, mensaje: string) {
    super(mensaje);
    this.name = 'IdentidadVisualError';
  }
}

export class PuntoAccesoNoEncontradoError extends IdentidadVisualError {
  constructor(identificador: string) {
    super('PUNTO_ACCESO_NO_ENCONTRADO', `El punto de acceso con el identificador '${identificador}' no fue encontrado.`);
  }
}

export class InstitucionNoDisponibleError extends IdentidadVisualError {
  constructor() {
    super('INSTITUCION_NO_DISPONIBLE', 'La institución no está activa o disponible.');
  }
}

export class IdentidadVisualNoConfiguradaError extends IdentidadVisualError {
  constructor() {
    super('IDENTIDAD_VISUAL_NO_CONFIGURADA', 'La identidad visual no ha sido configurada o publicada.');
  }
}

export class ContrasteInsuficienteError extends IdentidadVisualError {
  constructor(detalle: string) {
    super('CONTRASTE_INSUFICIENTE', `El contraste de color es insuficiente: ${detalle}`);
  }
}

export class ArchivoNoPermitidoError extends IdentidadVisualError {
  constructor(razon: string) {
    super('ARCHIVO_NO_PERMITIDO', `El archivo subido no cumple con las reglas: ${razon}`);
  }
}

export class ConflictoVersionError extends IdentidadVisualError {
  constructor(mensaje: string) {
    super('CONFLICTO_VERSION', mensaje);
  }
}
