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

  // Entidades
  RECURSO_NO_ENCONTRADO: 'El recurso solicitado no existe.',
  CODIGO_DUPLICADO: 'Ya existe un registro con ese código.',
  ENTIDAD_NO_PROCESABLE: 'Los datos enviados no son válidos.',
  ESTADO_INCOMPATIBLE: 'La operación no es válida para el estado actual del registro.',

  // Estructura académica
  CAPACIDAD_INVALIDA: 'La capacidad máxima debe ser un número positivo.',
  SECCION_NO_ENCONTRADA: 'La sección académica no existe.',
  OFERTA_NO_ENCONTRADA: 'La oferta educativa no existe.',

  // Currículo
  AREA_NO_ENCONTRADA: 'El área curricular no existe.',
  ASIGNATURA_NO_ENCONTRADA: 'La asignatura no existe.',
  PLAN_NO_ENCONTRADO: 'El plan de estudios no existe.',
  PLAN_VIGENTE_YA_EXISTE: 'Ya existe un plan vigente para ese año y grado.',
  PLAN_SIN_DETALLES: 'El plan debe tener al menos una asignatura activa para ser aprobado.',

  // Panel
  PANEL_NO_DISPONIBLE: 'El panel institucional no está disponible en este momento.',

  // Red / servidor
  ERROR_SERVIDOR: 'Ocurrió un error inesperado. Inténtalo más tarde.',
  ERROR_RED: 'No se pudo conectar con el servidor. Verifica tu conexión.',
};

export const MENSAJE_FALLBACK = 'Ocurrió un error inesperado. Inténtalo más tarde.';
