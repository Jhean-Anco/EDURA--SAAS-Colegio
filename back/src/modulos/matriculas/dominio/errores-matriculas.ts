import { ErrorDominio } from '../../../compartido/dominio/error-dominio';

export class MatriculaNoEncontradaError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'La matricula solicitada no existe.');
  }
}

export class EstudianteFueraDeInstitucionError extends ErrorDominio {
  constructor() {
    super(
      'CONTEXTO_NO_AUTORIZADO',
      'El estudiante no pertenece a la institucion del contexto.',
    );
  }
}

export class EstudianteEstadoInvalidoError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'El estudiante no se encuentra en un estado compatible para matricula.',
    );
  }
}

export class AnioAcademicoNoVigenteError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'El año academico no acepta matriculas en su estado actual.',
    );
  }
}

export class EstructuraAcademicaIncoherenteError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'La estructura academica es incoherente (sede, nivel, grado, año o oferta no corresponden).',
    );
  }
}

export class OfertaGradoSedeInactivaError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'La oferta de grado en la sede no esta activa.',
    );
  }
}

export class SeccionInactivaError extends ErrorDominio {
  constructor() {
    super('REGLA_NEGOCIO_INVALIDA', 'La seccion seleccionada no esta activa.');
  }
}

export class SeccionNoCorrespondeAOfertaError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'La seccion no corresponde a la oferta de grado seleccionada.',
    );
  }
}

export class EstudianteConMatriculaActivaError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'El estudiante ya posee una matricula ACTIVA para este año academico.',
    );
  }
}

export class SeccionSinCapacidadError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'La seccion no dispone de capacidad o vacantes disponibles.',
    );
  }
}

export class TransicionEstadoInvalidaError extends ErrorDominio {
  constructor(de: string, a: string) {
    super(
      'ESTADO_INCOMPATIBLE',
      `Transicion de estado invalida de ${de} a ${a}.`,
    );
  }
}

export class EdicionBorradorSoloPermitidaError extends ErrorDominio {
  constructor() {
    super(
      'ESTADO_INCOMPATIBLE',
      'No se permite editar datos estructurales despues de activar la matricula.',
    );
  }
}

export class OperacionSobreSedeNoPermitidaError extends ErrorDominio {
  constructor() {
    super(
      'CONTEXTO_NO_AUTORIZADO',
      'No tiene permisos para operar fuera de su sede autorizada.',
    );
  }
}
