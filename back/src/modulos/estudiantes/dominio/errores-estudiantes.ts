import { ErrorDominio } from '../../../compartido/dominio/error-dominio';

export class EstudianteNoEncontradoError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'El estudiante solicitado no existe.');
  }
}

export class EstudianteCodigoDuplicadoError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'El codigo del estudiante ya existe.');
  }
}

export class PersonaYaEsEstudianteError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'La persona ya esta asociada a un estudiante en la institucion.',
    );
  }
}

export class ApoderadoPrincipalExistenteError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'Ya existe un apoderado principal activo para este estudiante.',
    );
  }
}

export class PersonaFueraDeInstitucionError extends ErrorDominio {
  constructor() {
    super(
      'CONTEXTO_NO_AUTORIZADO',
      'La persona no pertenece a la institucion.',
    );
  }
}

export class SedeFueraDeInstitucionError extends ErrorDominio {
  constructor() {
    super('ENTIDAD_NO_PROCESABLE', 'La sede no pertenece a la institucion.');
  }
}
