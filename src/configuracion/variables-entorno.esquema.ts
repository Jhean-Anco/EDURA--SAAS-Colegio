import * as Joi from 'joi';

export const variablesEntornoEsquema = Joi.object({
  ENTORNO: Joi.string()
    .valid('desarrollo', 'pruebas', 'produccion', 'test')
    .default('desarrollo'),
  PUERTO_API: Joi.number().port().default(3000),
  ORIGENES_CORS: Joi.string().default('http://localhost:5173'),
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
}).unknown(true);
