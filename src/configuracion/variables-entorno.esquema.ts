import * as Joi from 'joi';

export const variablesEntornoEsquema = Joi.object({
  ENTORNO: Joi.string()
    .valid('desarrollo', 'pruebas', 'produccion', 'test')
    .default('desarrollo'),
  PUERTO_API: Joi.number().port().default(3000),
  ORIGENES_CORS: Joi.string().default('http://localhost:5173'),
  JWT_SECRETO: Joi.string().min(32).when('ENTORNO', {
    is: 'produccion',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  JWT_EMISOR: Joi.string().default('EDURA'),
  JWT_AUDIENCIA: Joi.string().default('EDURA_WEB'),
  HASH_TOKEN_SECRETO: Joi.string().min(32).when('ENTORNO', {
    is: 'produccion',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  JWT_ACCESO_TTL_SEGUNDOS: Joi.number().integer().positive().default(900),
  TOKEN_REFRESH_TTL_SEGUNDOS: Joi.number()
    .integer()
    .positive()
    .default(2592000),
  BD_HOST: Joi.string().required(),
  BD_PUERTO: Joi.number().port().required(),
  BD_USUARIO: Joi.string().required(),
  BD_CLAVE: Joi.string().required(),
  BD_NOMBRE: Joi.string().required(),
  BD_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
  BD_REGISTRO_CONSULTAS: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
  // Integraciones externas — Documentos (APIsPeru)
  INTEGRACION_DOCUMENTOS_HABILITADA: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
  PROVEEDOR_DOCUMENTOS: Joi.string().default('APISPERU'),
  APISPERU_URL_BASE: Joi.string()
    .uri()
    .default('https://dniruc.apisperu.com/api/v1'),
  APISPERU_TOKEN: Joi.string().when('INTEGRACION_DOCUMENTOS_HABILITADA', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
  APISPERU_TIMEOUT_MS: Joi.number().integer().positive().default(3000),
  // Integraciones externas — Rutas (Google)
  INTEGRACION_RUTAS_HABILITADA: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
  GOOGLE_MAPS_TIMEOUT_MS: Joi.number().integer().positive().default(4000),
  GOOGLE_ROUTES_API_KEY: Joi.string().when('INTEGRACION_RUTAS_HABILITADA', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
  GOOGLE_ROUTES_URL_BASE: Joi.string()
    .uri()
    .default('https://routes.googleapis.com/directions/v2:computeRoutes'),
}).unknown(true);
