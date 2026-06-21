import { ErrorDominio } from '../../../compartido/dominio/error-dominio';

export class DocenteNoEncontradoError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Docente no encontrado');
  }
}

export class PersonaFueraDeInstitucionDocenteError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'La persona no pertenece a esta institución',
    );
  }
}

export class PersonaYaEsDocenteError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'La persona ya tiene un perfil docente en esta institución',
    );
  }
}

export class CodigoDocenteDuplicadoError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'El código de docente ya está en uso en esta institución',
    );
  }
}

export class SedeFueraDeInstitucionDocenteError extends ErrorDominio {
  constructor() {
    super('REGLA_NEGOCIO_INVALIDA', 'La sede no pertenece a esta institución');
  }
}

export class DocenteFueraDeSedeError extends ErrorDominio {
  constructor() {
    super(
      'RECURSO_NO_ENCONTRADO',
      'El docente no tiene asignación en esta sede',
    );
  }
}

export class AsignacionSedeDuplicadaError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'El docente ya tiene una asignación activa en esta sede',
    );
  }
}

export class UltimaSedeActivaError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'No se puede inactivar la última sede activa de un docente activo',
    );
  }
}

export class SedePrincipalExistenteError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'El docente ya tiene una sede principal activa');
  }
}

export class EspecialidadNoEncontradaError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Especialidad profesional no encontrada');
  }
}

export class EspecialidadDuplicadaError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'La especialidad ya existe en esta institución');
  }
}

export class EspecialidadDocenteDuplicadaError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'El docente ya tiene asignada esta especialidad activa',
    );
  }
}

export class EspecialidadPrincipalExistenteError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'El docente ya tiene una especialidad principal activa',
    );
  }
}

export class TransicionEstadoDocenteInvalidaError extends ErrorDominio {
  constructor(mensaje: string) {
    super('ESTADO_INCOMPATIBLE', mensaje);
  }
}

export class PerfilDocenteNoVinculadoError extends ErrorDominio {
  constructor() {
    super(
      'RECURSO_NO_ENCONTRADO',
      'No existe perfil docente vinculado a este usuario',
    );
  }
}

export class AsignacionDocenteSedNoEncontradaError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Asignación de sede no encontrada');
  }
}
