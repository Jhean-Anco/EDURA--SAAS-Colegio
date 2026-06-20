import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ES_PUBLICO } from '../../src/compartido/presentacion/http/decoradores/publico.decorador';
import { PERMISOS_REQUERIDOS } from '../../src/compartido/presentacion/http/decoradores/permisos.decorador';
import { GuardiaPermisos } from '../../src/compartido/presentacion/http/guardias/guardia-permisos';
import {
  CONSULTADOR_PERMISOS_EFECTIVOS,
  ConsultadorPermisosEfectivos,
} from '../../src/compartido/infraestructura/persistencia/consultador-permisos.typeorm';
import { ContextoSolicitudAutenticada } from '../../src/compartido/aplicacion/contexto-solicitud-autenticada';

function crearContextoHttp(
  extras: Partial<{ contextoActual: ContextoSolicitudAutenticada }> = {},
  permisos: string[] | undefined = undefined,
): ExecutionContext {
  const request = { ...extras };
  const reflector = new Reflector();
  jest
    .spyOn(reflector, 'getAllAndOverride')
    .mockReturnValue(permisos as unknown as never);
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('GuardiaPermisos', () => {
  let consultador: jest.Mocked<ConsultadorPermisosEfectivos>;
  let reflector: Reflector;

  beforeEach(() => {
    consultador = { listar: jest.fn() };
    reflector = new Reflector();
  });

  function crearGuardia(): GuardiaPermisos {
    const guardia = new GuardiaPermisos(reflector, consultador);
    return guardia;
  }

  it('devuelve true cuando no hay permisos requeridos declarados', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const guardia = crearGuardia();
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;
    await expect(guardia.canActivate(ctx)).resolves.toBe(true);
  });

  it('devuelve true cuando la lista de permisos está vacía', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const guardia = crearGuardia();
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;
    await expect(guardia.canActivate(ctx)).resolves.toBe(true);
  });

  it('lanza ForbiddenException cuando el token es PRECONTEXTO', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['PERSONAS.LEER']);
    const guardia = crearGuardia();
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          contextoActual: {
            tipoToken: 'PRECONTEXTO',
            ambito: null,
            rolId: null,
            usuarioId: 'u1',
            institucionId: null,
            sedeId: null,
          } satisfies ContextoSolicitudAutenticada,
        }),
      }),
    } as unknown as ExecutionContext;
    await expect(guardia.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('lanza ForbiddenException cuando el ámbito es null en token ACCESO', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['PERSONAS.LEER']);
    const guardia = crearGuardia();
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          contextoActual: {
            tipoToken: 'ACCESO',
            ambito: null,
            rolId: 'r1',
            usuarioId: 'u1',
            institucionId: null,
            sedeId: null,
          } satisfies ContextoSolicitudAutenticada,
        }),
      }),
    } as unknown as ExecutionContext;
    await expect(guardia.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('lanza ForbiddenException cuando el usuario no tiene el permiso requerido', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['PERSONAS.CREAR']);
    consultador.listar.mockResolvedValue(['PERSONAS.LEER']);
    const guardia = crearGuardia();
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          contextoActual: {
            tipoToken: 'ACCESO',
            ambito: 'INSTITUCION',
            rolId: 'r1',
            usuarioId: 'u1',
            institucionId: 'i1',
            sedeId: null,
          } satisfies ContextoSolicitudAutenticada,
        }),
      }),
    } as unknown as ExecutionContext;
    await expect(guardia.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('devuelve true cuando el usuario tiene todos los permisos requeridos', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['PERSONAS.LEER', 'PERSONAS.CREAR']);
    consultador.listar.mockResolvedValue([
      'PERSONAS.LEER',
      'PERSONAS.CREAR',
      'SEDES.LEER',
    ]);
    const guardia = crearGuardia();
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          contextoActual: {
            tipoToken: 'ACCESO',
            ambito: 'INSTITUCION',
            rolId: 'r1',
            usuarioId: 'u1',
            institucionId: 'i1',
            sedeId: null,
          } satisfies ContextoSolicitudAutenticada,
        }),
      }),
    } as unknown as ExecutionContext;
    await expect(guardia.canActivate(ctx)).resolves.toBe(true);
  });

  it('consulta permisos con los datos correctos del contexto', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['SEDES.LEER']);
    consultador.listar.mockResolvedValue(['SEDES.LEER']);
    const guardia = crearGuardia();
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          contextoActual: {
            tipoToken: 'ACCESO',
            ambito: 'SEDE',
            rolId: 'rol-director',
            usuarioId: 'usuario-123',
            institucionId: 'inst-456',
            sedeId: 'sede-789',
          } satisfies ContextoSolicitudAutenticada,
        }),
      }),
    } as unknown as ExecutionContext;
    await guardia.canActivate(ctx);
    expect(consultador.listar).toHaveBeenCalledWith({
      usuarioId: 'usuario-123',
      rolId: 'rol-director',
      institucionId: 'inst-456',
      sedeId: 'sede-789',
    });
  });
});

describe('Decorador @Publico', () => {
  it('establece metadata ES_PUBLICO en true', () => {
    class TestControlador {
      @(require('../../src/compartido/presentacion/http/decoradores/publico.decorador').Publico)()
      metodo() {}
    }
    const reflector = new Reflector();
    const metadata = Reflect.getMetadata(
      ES_PUBLICO,
      TestControlador.prototype.metodo,
    );
    expect(metadata).toBe(true);
  });
});

describe('Decorador @Permisos', () => {
  it('establece metadata PERMISOS_REQUERIDOS con los códigos dados', () => {
    class TestControlador {
      @(require('../../src/compartido/presentacion/http/decoradores/permisos.decorador').Permisos)('PERSONAS.LEER', 'PERSONAS.CREAR')
      metodo() {}
    }
    const metadata = Reflect.getMetadata(
      PERMISOS_REQUERIDOS,
      TestControlador.prototype.metodo,
    );
    expect(metadata).toEqual(['PERSONAS.LEER', 'PERSONAS.CREAR']);
  });
});

// Silenciar el símbolo exportado para que no falle el import
void CONSULTADOR_PERMISOS_EFECTIVOS;
