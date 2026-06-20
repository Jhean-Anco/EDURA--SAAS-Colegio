import { APP_GUARD } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { AutenticacionControlador } from '../../src/modulos/identidad-acceso/presentacion/http/controladores/autenticacion.controlador';
import { HealthController } from '../../src/salud/salud.controlador';
import { ES_PUBLICO } from '../../src/compartido/presentacion/http/decoradores/publico.decorador';
import { PERMISOS_REQUERIDOS } from '../../src/compartido/presentacion/http/decoradores/permisos.decorador';
import { InstitucionesControlador } from '../../src/modulos/estructura-institucional/presentacion/http/controladores/instituciones.controlador';
import { SedesControlador } from '../../src/modulos/estructura-institucional/presentacion/http/controladores/sedes.controlador';
import { InfraestructuraControlador } from '../../src/modulos/infraestructura-fisica/presentacion/http/controladores/infraestructura.controlador';
import { PersonasControlador } from '../../src/modulos/personas/presentacion/http/controladores/personas.controlador';
import { IntegracionesControlador } from '../../src/modulos/integraciones-externas/presentacion/http/integraciones.controlador';

function obtenerMetodo<T extends object>(
  prototipo: T,
  nombre: keyof T,
): object {
  const descriptor = Object.getOwnPropertyDescriptor(prototipo, nombre);
  if (!descriptor?.value) {
    throw new Error(`Metodo no encontrado: ${String(nombre)}`);
  }
  return descriptor.value as object;
}

describe('Seguridad HTTP', () => {
  it('declara APP_GUARD para autenticacion y permisos', () => {
    const proveedores = Reflect.getMetadata(
      'providers',
      AppModule,
    ) as unknown[];
    expect(proveedores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ provide: APP_GUARD }),
        expect.objectContaining({ provide: APP_GUARD }),
      ]),
    );
  });

  it('marca explicitamente los endpoints publicos', () => {
    expect(
      Reflect.getMetadata(
        ES_PUBLICO,
        obtenerMetodo(AutenticacionControlador.prototype, 'iniciar'),
      ),
    ).toBe(true);
    expect(
      Reflect.getMetadata(
        ES_PUBLICO,
        obtenerMetodo(AutenticacionControlador.prototype, 'renovar'),
      ),
    ).toBe(true);
    expect(
      Reflect.getMetadata(
        ES_PUBLICO,
        obtenerMetodo(HealthController.prototype, 'obtenerSalud'),
      ),
    ).toBe(true);
  });

  it('exige permisos en endpoints de escritura y negocio', () => {
    expect(
      Reflect.getMetadata(
        PERMISOS_REQUERIDOS,
        obtenerMetodo(InstitucionesControlador.prototype, 'crear'),
      ),
    ).toContain('INSTITUCIONES.CREAR');
    expect(
      Reflect.getMetadata(
        PERMISOS_REQUERIDOS,
        obtenerMetodo(SedesControlador.prototype, 'crear'),
      ),
    ).toContain('SEDES.CREAR');
    expect(
      Reflect.getMetadata(
        PERMISOS_REQUERIDOS,
        obtenerMetodo(InfraestructuraControlador.prototype, 'listar'),
      ),
    ).toContain('INFRAESTRUCTURA.LEER');
    expect(
      Reflect.getMetadata(
        PERMISOS_REQUERIDOS,
        obtenerMetodo(PersonasControlador.prototype, 'crear'),
      ),
    ).toContain('PERSONAS.CREAR');
    expect(
      Reflect.getMetadata(
        PERMISOS_REQUERIDOS,
        obtenerMetodo(IntegracionesControlador.prototype, 'consultarDni'),
      ),
    ).toContain('PERSONAS.CONSULTAR_DNI');
  });
});
