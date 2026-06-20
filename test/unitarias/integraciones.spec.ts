import { BadRequestException } from '@nestjs/common';
import { ConsultarDniCasoUso } from '../../src/modulos/integraciones-externas/aplicacion/consultar-dni.caso-uso';
import { ConsultarRucCasoUso } from '../../src/modulos/integraciones-externas/aplicacion/consultar-ruc.caso-uso';
import { CalcularRutaCasoUso } from '../../src/modulos/integraciones-externas/aplicacion/calcular-ruta.caso-uso';
import { DniNoDisponible } from '../../src/modulos/integraciones-externas/infraestructura/proveedores-no-disponibles/dni-no-disponible';
import { RucNoDisponible } from '../../src/modulos/integraciones-externas/infraestructura/proveedores-no-disponibles/ruc-no-disponible';
import { RutasNoDisponible } from '../../src/modulos/integraciones-externas/infraestructura/proveedores-no-disponibles/rutas-no-disponible';

describe('ConsultarDniCasoUso', () => {
  it('lanza BadRequestException si DNI no tiene 8 dígitos', async () => {
    const caso = new ConsultarDniCasoUso(new DniNoDisponible());
    await expect(caso.ejecutar('1234567')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(caso.ejecutar('123456789')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(caso.ejecutar('abcdefgh')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('retorna disponible=false con proveedor no disponible', async () => {
    const caso = new ConsultarDniCasoUso(new DniNoDisponible());
    const resultado = await caso.ejecutar('12345678');
    expect(resultado.disponible).toBe(false);
    expect(resultado.datosSugeridos).toBeNull();
    expect(resultado.advertencias.length).toBeGreaterThan(0);
  });

  it('normaliza espacios en el DNI', async () => {
    const consultador = new DniNoDisponible();
    const spy = jest.spyOn(consultador, 'consultar').mockResolvedValue({
      disponible: false,
      datosSugeridos: null,
      advertencias: [],
    });
    const caso = new ConsultarDniCasoUso(consultador);
    await caso.ejecutar(' 12345678 ');
    expect(spy).toHaveBeenCalledWith('12345678');
  });
});

describe('ConsultarRucCasoUso', () => {
  it('lanza BadRequestException si RUC no tiene 11 dígitos', async () => {
    const caso = new ConsultarRucCasoUso(new RucNoDisponible());
    await expect(caso.ejecutar('1234567890')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(caso.ejecutar('123456789012')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(caso.ejecutar('abcdefghijk')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('retorna disponible=false con proveedor no disponible', async () => {
    const caso = new ConsultarRucCasoUso(new RucNoDisponible());
    const resultado = await caso.ejecutar('12345678901');
    expect(resultado.disponible).toBe(false);
    expect(resultado.datosSugeridos).toBeNull();
    expect(resultado.advertencias.length).toBeGreaterThan(0);
  });
});

describe('CalcularRutaCasoUso', () => {
  const lima = { latitud: -12.046374, longitud: -77.042793 };
  const cusco = { latitud: -13.53195, longitud: -71.96742 };

  it('lanza BadRequestException si latitud fuera de rango', async () => {
    const caso = new CalcularRutaCasoUso(new RutasNoDisponible());
    await expect(
      caso.ejecutar({ latitud: 95, longitud: 0 }, cusco),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      caso.ejecutar(lima, { latitud: -95, longitud: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lanza BadRequestException si longitud fuera de rango', async () => {
    const caso = new CalcularRutaCasoUso(new RutasNoDisponible());
    await expect(
      caso.ejecutar({ latitud: 0, longitud: 200 }, cusco),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      caso.ejecutar(lima, { latitud: 0, longitud: -200 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('retorna disponible=false con proveedor no disponible', async () => {
    const caso = new CalcularRutaCasoUso(new RutasNoDisponible());
    const resultado = await caso.ejecutar(lima, cusco);
    expect(resultado.disponible).toBe(false);
    expect(resultado.resultado).toBeNull();
    expect(resultado.advertencias.length).toBeGreaterThan(0);
  });
});

describe('Proveedores no disponibles', () => {
  it('DniNoDisponible nunca lanza excepción', async () => {
    const proveedor = new DniNoDisponible();
    await expect(proveedor.consultar('12345678')).resolves.toBeDefined();
  });

  it('RucNoDisponible nunca lanza excepción', async () => {
    const proveedor = new RucNoDisponible();
    await expect(proveedor.consultar('12345678901')).resolves.toBeDefined();
  });

  it('RutasNoDisponible nunca lanza excepción', async () => {
    const proveedor = new RutasNoDisponible();
    await expect(
      proveedor.calcular(
        { latitud: 0, longitud: 0 },
        { latitud: 1, longitud: 1 },
      ),
    ).resolves.toBeDefined();
  });
});
