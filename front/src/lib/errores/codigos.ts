export const MENSAJES_ERROR: Record<string, string> = {
  // Autenticación
  CREDENCIALES_INVALIDAS: 'El correo o la contraseña son incorrectos.',
  CUENTA_DESACTIVADA: 'Tu cuenta está desactivada. Contacta al administrador.',
  SESION_EXPIRADA: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  TOKEN_INVALIDO: 'Tu sesión no es válida. Inicia sesión nuevamente.',
  REFRESH_TOKEN_INVALIDO: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  CONTEXTO_NO_AUTORIZADO: 'No tienes acceso a este contexto institucional.',
  SIN_CONTEXTOS_DISPONIBLES: 'No tienes contextos institucionales asignados.',

  // Permisos
  ACCESO_DENEGADO: 'No tienes permisos para realizar esta acción.',
  PERMISO_INSUFICIENTE: 'No tienes los permisos necesarios.',

  // Entidades genéricas
  RECURSO_NO_ENCONTRADO: 'El recurso solicitado no existe.',
  CODIGO_DUPLICADO: 'Ya existe un registro con ese código o valor.',
  ENTIDAD_NO_PROCESABLE: 'Los datos enviados no son válidos para esta operación.',
  ESTADO_INCOMPATIBLE: 'La operación no es válida para el estado actual del registro.',
  REGLA_NEGOCIO_INVALIDA: 'La operación viola una regla de negocio.',

  // Estructura académica
  CAPACIDAD_INVALIDA: 'La capacidad máxima debe ser un número positivo.',
  SECCION_NO_ENCONTRADA: 'La sección académica no existe.',
  OFERTA_NO_ENCONTRADA: 'La oferta educativa no existe.',

  // Currículo — áreas
  AREA_NO_ENCONTRADA: 'El área curricular no existe.',
  AREA_CON_ASIGNATURAS_ACTIVAS: 'No se puede inactivar un área con asignaturas activas.',

  // Currículo — asignaturas
  ASIGNATURA_NO_ENCONTRADA: 'La asignatura no existe.',
  ASIGNATURA_EN_USO: 'No se puede inactivar una asignatura utilizada por un plan activo.',
  ASIGNATURA_AREA_FUERA_INSTITUCION: 'El área curricular no pertenece a esta institución.',

  // Currículo — planes
  PLAN_NO_ENCONTRADO: 'El plan de estudios no existe.',
  PLAN_VIGENTE_YA_EXISTE: 'Ya existe un plan vigente para ese año y grado.',
  PLAN_SIN_DETALLES: 'El plan debe tener al menos una asignatura activa antes de aprobarse.',
  PLAN_ASIGNATURA_INACTIVA: 'Todas las asignaturas del plan deben estar activas en el catálogo.',
  PLAN_NO_MODIFICABLE: 'Los detalles de un plan solo pueden modificarse en estado BORRADOR.',
  PLAN_ANIO_NO_DISPONIBLE: 'No se puede crear un plan para un año cerrado o anulado.',
  PLAN_ANIO_FUERA_INSTITUCION: 'El año académico no pertenece a esta institución.',
  PLAN_GRADO_FUERA_INSTITUCION: 'El grado educativo no pertenece a esta institución.',
  PLAN_VIGENTE_NO_ENCONTRADO: 'No existe un plan vigente para el año y grado indicados.',

  // Currículo — detalles
  DETALLE_NO_ENCONTRADO: 'El detalle del plan no existe.',
  DETALLE_ASIGNATURA_DUPLICADA: 'La asignatura ya existe en el plan.',
  DETALLE_HORAS_INVALIDAS: 'Las horas semanales y anuales deben ser mayores a cero.',

  // Panel
  PANEL_NO_DISPONIBLE: 'El panel institucional no está disponible en este momento.',

  // Red / servidor
  ERROR_SERVIDOR: 'Ocurrió un error inesperado. Inténtalo más tarde.',
  ERROR_RED: 'No se pudo conectar con el servidor. Verifica tu conexión.',
};

export const MENSAJE_FALLBACK = 'Ocurrió un error inesperado. Inténtalo más tarde.';
