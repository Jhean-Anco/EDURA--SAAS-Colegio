import { ErrorDominio } from '../../../compartido/dominio/error-dominio';

export class AnioAcademicoNoEncontradoError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Año académico no encontrado');
  }
}

export class AnioAcademicoYaExisteError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'Ya existe un año académico con ese número de año en la institución',
    );
  }
}

export class AnioEnCursoYaExisteError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'Ya existe un año académico ACTIVO en la institución',
    );
  }
}

export class TransicionAnioInvalidaError extends ErrorDominio {
  constructor(desde: string, hacia: string) {
    super(
      'ESTADO_INCOMPATIBLE',
      `No se puede cambiar el estado del año académico de ${desde} a ${hacia}`,
    );
  }
}

export class PeriodoAcademicoNoEncontradoError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Período académico no encontrado');
  }
}

export class PeriodoCodigoDuplicadoError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'Ya existe un período con ese código en el año académico',
    );
  }
}

export class PeriodoEnCursoYaExisteError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'Ya existe un período ACTIVO en este año académico',
    );
  }
}

export class PeriodoSolapamientoError extends ErrorDominio {
  constructor() {
    super(
      'REGLA_NEGOCIO_INVALIDA',
      'Las fechas del período se solapan con otro período del mismo año académico',
    );
  }
}

export class TransicionPeriodoInvalidaError extends ErrorDominio {
  constructor(desde: string, hacia: string) {
    super(
      'ESTADO_INCOMPATIBLE',
      `No se puede cambiar el estado del período de ${desde} a ${hacia}`,
    );
  }
}

export class NivelEducativoNoEncontradoError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Nivel educativo no encontrado');
  }
}

export class NivelCodigoDuplicadoError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'Ya existe un nivel educativo con ese código en la institución',
    );
  }
}

export class GradoEducativoNoEncontradoError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Grado educativo no encontrado');
  }
}

export class GradoCodigoDuplicadoError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'Ya existe un grado con ese código en el nivel educativo',
    );
  }
}

export class OfertaGradoSedeNoEncontradaError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Oferta de grado por sede no encontrada');
  }
}

export class OfertaDuplicadaError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'Ya existe una oferta para este grado, sede y año académico',
    );
  }
}

export class SeccionAcademicaNoEncontradaError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Sección académica no encontrada');
  }
}

export class SeccionNombreDuplicadoError extends ErrorDominio {
  constructor() {
    super(
      'CODIGO_DUPLICADO',
      'Ya existe una sección con ese nombre en la oferta',
    );
  }
}

export class EspacioFisicoFueraDeSedeError extends ErrorDominio {
  constructor() {
    super(
      'ENTIDAD_NO_PROCESABLE',
      'El espacio físico no pertenece a la misma sede de la oferta',
    );
  }
}

export class TutorFueraDeSedeError extends ErrorDominio {
  constructor() {
    super(
      'ENTIDAD_NO_PROCESABLE',
      'El docente tutor no tiene una asignación activa en la sede de la oferta',
    );
  }
}
