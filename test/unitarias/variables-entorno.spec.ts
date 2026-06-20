import { variablesEntornoEsquema } from '../../src/configuracion/variables-entorno.esquema';

describe('Variables de entorno', () => {
  it('valida la configuracion minima', () => {
    const resultado = variablesEntornoEsquema.validate({
      ENTORNO: 'desarrollo',
      PUERTO_API: 3000,
      ORIGENES_CORS: 'http://localhost:5173',
      BD_HOST: 'localhost',
      BD_PUERTO: 5432,
      BD_USUARIO: 'edura',
      BD_CLAVE: 'edura_desarrollo',
      BD_NOMBRE: 'edura',
      BD_SSL: false,
      BD_REGISTRO_CONSULTAS: false,
    });
    expect(resultado.error).toBeUndefined();
  });
});
