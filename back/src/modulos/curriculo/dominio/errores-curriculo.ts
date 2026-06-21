import { ErrorDominio } from '../../../compartido/dominio/error-dominio';

export class AreaCurricularNoEncontradaError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Área curricular no encontrada');
  }
}

export class AreaCodigoDuplicadoError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'Ya existe un área con ese código en la institución');
  }
}

export class AreaNombreDuplicadoError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'Ya existe un área con ese nombre en la institución');
  }
}

export class AreaOrdenDuplicadoError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'Ya existe un área con ese orden en la institución');
  }
}

export class AreaConAsignaturasActivasError extends ErrorDominio {
  constructor() {
    super('REGLA_NEGOCIO_INVALIDA', 'No se puede inactivar un área con asignaturas activas');
  }
}

export class TransicionAreaInvalidaError extends ErrorDominio {
  constructor(desde: string, hacia: string) {
    super('ESTADO_INCOMPATIBLE', `No se puede cambiar el estado del área de ${desde} a ${hacia}`);
  }
}

export class AsignaturaNoEncontradaError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Asignatura no encontrada');
  }
}

export class AsignaturaCodigoDuplicadoError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'Ya existe una asignatura con ese código en la institución');
  }
}

export class AsignaturaOrdenDuplicadoError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'Ya existe una asignatura con ese orden en el área');
  }
}

export class AsignaturaAreaFueraDeInstitucionError extends ErrorDominio {
  constructor() {
    super('ENTIDAD_NO_PROCESABLE', 'El área curricular no pertenece a la institución');
  }
}

export class AsignaturaEnUsoError extends ErrorDominio {
  constructor() {
    super('REGLA_NEGOCIO_INVALIDA', 'No se puede inactivar una asignatura utilizada por un plan activo');
  }
}

export class TransicionAsignaturaInvalidaError extends ErrorDominio {
  constructor(desde: string, hacia: string) {
    super('ESTADO_INCOMPATIBLE', `No se puede cambiar el estado de la asignatura de ${desde} a ${hacia}`);
  }
}

export class PlanEstudioNoEncontradoError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Plan de estudio no encontrado');
  }
}

export class PlanCodigoDuplicadoError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'Ya existe un plan con ese código en la institución');
  }
}

export class PlanVersionDuplicadaError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'Ya existe un plan con esa versión para el mismo año y grado');
  }
}

export class PlanAnioFueraDeInstitucionError extends ErrorDominio {
  constructor() {
    super('ENTIDAD_NO_PROCESABLE', 'El año académico no pertenece a la institución');
  }
}

export class PlanGradoFueraDeInstitucionError extends ErrorDominio {
  constructor() {
    super('ENTIDAD_NO_PROCESABLE', 'El grado educativo no pertenece a la institución');
  }
}

export class PlanAnioNoDisponibleError extends ErrorDominio {
  constructor() {
    super('ENTIDAD_NO_PROCESABLE', 'No se puede crear un plan para un año cerrado o anulado');
  }
}

export class PlanSinDetallesError extends ErrorDominio {
  constructor() {
    super('REGLA_NEGOCIO_INVALIDA', 'El plan debe tener al menos una asignatura activa antes de aprobarse');
  }
}

export class PlanAsignaturaInactivaError extends ErrorDominio {
  constructor() {
    super('REGLA_NEGOCIO_INVALIDA', 'Todas las asignaturas del plan deben estar activas en el catálogo');
  }
}

export class PlanVigenteYaExisteError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'Ya existe un plan vigente para este año y grado en la institución');
  }
}

export class TransicionPlanInvalidaError extends ErrorDominio {
  constructor(desde: string, hacia: string) {
    super('ESTADO_INCOMPATIBLE', `No se puede cambiar el estado del plan de ${desde} a ${hacia}`);
  }
}

export class PlanNoModificableError extends ErrorDominio {
  constructor() {
    super('ESTADO_INCOMPATIBLE', 'Los detalles de un plan solo pueden modificarse en estado BORRADOR');
  }
}

export class DetalleNoEncontradoError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'Detalle de plan no encontrado');
  }
}

export class DetalleAsignaturaDuplicadaError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'La asignatura ya existe en el plan');
  }
}

export class DetalleOrdenDuplicadoError extends ErrorDominio {
  constructor() {
    super('CODIGO_DUPLICADO', 'Ya existe un detalle con ese orden en el plan');
  }
}

export class DetalleHorasInvalidasError extends ErrorDominio {
  constructor() {
    super('REGLA_NEGOCIO_INVALIDA', 'Las horas semanales y anuales deben ser mayores a cero');
  }
}

export class AmbiteInstitucionRequeridoError extends ErrorDominio {
  constructor() {
    super('CONTEXTO_NO_AUTORIZADO', 'Esta operación requiere ámbito institucional');
  }
}

export class PlanVigenteNoEncontradoError extends ErrorDominio {
  constructor() {
    super('RECURSO_NO_ENCONTRADO', 'No existe un plan vigente para el año y grado indicados');
  }
}
