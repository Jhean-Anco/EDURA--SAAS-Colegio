import { ErrorDominio } from './error-dominio';

export class RecursoNoEncontradoError extends ErrorDominio {
  constructor(
    mensaje = 'El recurso solicitado no existe.',
    detalles?: Record<string, unknown>,
  ) {
    super('RECURSO_NO_ENCONTRADO', mensaje, detalles);
  }
}

export class CodigoDuplicadoError extends ErrorDominio {
  constructor(
    mensaje = 'El código ya existe.',
    detalles?: Record<string, unknown>,
  ) {
    super('CODIGO_DUPLICADO', mensaje, detalles);
  }
}

export class SlugDuplicadoError extends ErrorDominio {
  constructor(
    mensaje = 'El slug ya existe.',
    detalles?: Record<string, unknown>,
  ) {
    super('SLUG_DUPLICADO', mensaje, detalles);
  }
}

export class EstadoIncompatibleError extends ErrorDominio {
  constructor(
    mensaje = 'El estado no permite esta operación.',
    detalles?: Record<string, unknown>,
  ) {
    super('ESTADO_INCOMPATIBLE', mensaje, detalles);
  }
}

export class ReglaNegocioError extends ErrorDominio {
  constructor(
    mensaje = 'La regla de negocio no se cumple.',
    detalles?: Record<string, unknown>,
  ) {
    super('REGLA_NEGOCIO_INVALIDA', mensaje, detalles);
  }
}

export class ConflictoVersionError extends ErrorDominio {
  constructor(
    mensaje = 'La versión esperada no coincide.',
    detalles?: Record<string, unknown>,
  ) {
    super('CONFLICTO_VERSION', mensaje, detalles);
  }
}

export class JerarquiaInvalidaError extends ErrorDominio {
  constructor(
    mensaje = 'La jerarquía es inválida.',
    detalles?: Record<string, unknown>,
  ) {
    super('JERARQUIA_INVALIDA', mensaje, detalles);
  }
}

export class CicloInfraestructuraError extends ErrorDominio {
  constructor(
    mensaje = 'La jerarquía produce un ciclo.',
    detalles?: Record<string, unknown>,
  ) {
    super('CICLO_INFRAESTRUCTURA', mensaje, detalles);
  }
}

export class SedeInactivaError extends ErrorDominio {
  constructor(
    mensaje = 'La sede está inactiva.',
    detalles?: Record<string, unknown>,
  ) {
    super('SEDE_INACTIVA', mensaje, detalles);
  }
}

export class EspecializacionIncompatibleError extends ErrorDominio {
  constructor(
    mensaje = 'La especialización no coincide con el tipo.',
    detalles?: Record<string, unknown>,
  ) {
    super('ESPECIALIZACION_INCOMPATIBLE', mensaje, detalles);
  }
}
