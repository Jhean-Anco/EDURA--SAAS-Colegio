import * as Joi from 'joi';

export const variablesEntornoEsquema = Joi.object({
  ENTORNO: Joi.string()
    .valid('desarrollo', 'pruebas', 'produccion', 'test')
    .default('desarrollo'),
  PUERTO_API: Joi.number().port().default(3000),
  ORIGENES_CORS: Joi.string().default('http://localhost:5173'),
  SWAGGER_HABILITADO: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
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
  BD_HOST: Joi.string().when('ENTORNO', {
    is: 'produccion',
    then: Joi.required(),
    otherwise: Joi.string().default('localhost'),
  }),
  BD_PUERTO: Joi.number()
    .port()
    .when('ENTORNO', {
      is: 'produccion',
      then: Joi.required(),
      otherwise: Joi.number().port().default(5432),
    }),
  BD_USUARIO: Joi.string().when('ENTORNO', {
    is: 'produccion',
    then: Joi.required(),
    otherwise: Joi.string().default('postgres'),
  }),
  BD_CLAVE: Joi.string().when('ENTORNO', {
    is: 'produccion',
    then: Joi.required(),
    otherwise: Joi.string().default('postgres'),
  }),
  BD_NOMBRE: Joi.string().when('ENTORNO', {
    is: 'produccion',
    then: Joi.required(),
    otherwise: Joi.string().default('edura'),
  }),
  BD_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
  BD_REGISTRO_CONSULTAS: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
  APISPERU_TOKEN: Joi.string().allow('').optional(),
  APISPERU_URL_BASE: Joi.string()
    .uri()
    .default('https://dniruc.apisperu.com/api/v1'),
  APISPERU_TIMEOUT_MS: Joi.number().integer().positive().default(3000),
  GOOGLE_MAPS_API_KEY: Joi.string().allow('').optional(),
  GOOGLE_MAPS_TIMEOUT_MS: Joi.number().integer().positive().default(4000),
  INTEGRACION_DOCUMENTOS_HABILITADA: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
  INTEGRACION_RUTAS_HABILITADA: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
}).unknown(true);
