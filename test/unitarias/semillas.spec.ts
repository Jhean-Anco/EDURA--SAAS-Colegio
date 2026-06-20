import { catalogos } from '../../src/base-datos/typeorm/semillas/catalogos';

describe('Semillas', () => {
  it('define catálogos tipados y legibles', () => {
    expect(catalogos.estadosConservacion[0]).toMatchObject({
      codigo: 'NUEVO',
      nombre: 'Nuevo',
      orden: 1,
    });
    expect(catalogos.unidadesMedida).toContainEqual({
      codigo: 'METRO',
      nombre: 'Metro',
      simbolo: 'm',
      magnitud: 'LONGITUD',
    });
    expect(catalogos.tiposEspacioFisico).toContainEqual({
      codigo: 'AULA',
      nombre: 'Aula',
      requiereAforo: true,
    });
  });
});
