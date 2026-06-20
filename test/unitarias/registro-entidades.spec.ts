import { entidadesTypeOrm } from '../../src/base-datos/typeorm/typeorm.registro';

describe('Registro TypeORM', () => {
  it('incluye entidades esperadas', () => {
    expect(entidadesTypeOrm.length).toBeGreaterThan(10);
  });
});
