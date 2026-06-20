import { configuracionTypeOrm } from '../../src/base-datos/typeorm/typeorm.options';

describe('Configuración', () => {
  it('mantiene synchronize y migrationsRun desactivados', () => {
    const opciones = configuracionTypeOrm();
    expect(opciones.synchronize).toBe(false);
    expect(opciones.migrationsRun).toBe(false);
    expect(opciones.migrationsTableName).toBe('migraciones_aplicadas');
  });
});
