import { catalogos } from '../../src/base-datos/typeorm/semillas/catalogos';

describe('Semillas', () => {
  it('define catálogos idempotentes', () => {
    expect(catalogos.tiposServicioBasico).toContain('AGUA_POTABLE');
    expect(catalogos.unidadesMedida).toContain('METRO');
  });
});
