import { Test } from '@nestjs/testing';
import { HealthController } from '../../src/salud/salud.controlador';
import { IndicadorBaseDatos } from '../../src/salud/indicadores/indicador-base-datos.service';

describe('HealthController', () => {
  it('responde con el formato esperado', async () => {
    const modulo = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: IndicadorBaseDatos,
          useValue: { verificar: () => Promise.resolve(true) },
        },
      ],
    }).compile();
    const controlador = modulo.get(HealthController);
    const respuesta = await controlador.obtenerSalud();
    expect(respuesta.estado).toBe('disponible');
    expect(respuesta.baseDatos).toBe('disponible');
  });
});
