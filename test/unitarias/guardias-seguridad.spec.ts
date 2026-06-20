import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ES_PUBLICO,
  Publico,
} from '../../src/compartido/presentacion/http/decoradores/publico.decorador';
import {
  PERMISOS_REQUERIDOS,
  Permisos,
} from '../../src/compartido/presentacion/http/decoradores/permisos.decorador';
import { GuardiaPermisos } from '../../src/compartido/presentacion/http/guardias/guardia-permisos';
import {
  CONSULTADOR_PERMISOS_EFECTIVOS,
  ConsultadorPermisosEfectivos,
} from '../../src/compartido/infraestructura/persistencia/consultador-permisos.typeorm';
import { ContextoSolicitudAutenticada } from '../../src/compartido/aplicacion/contexto-solicitud-autenticada';

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
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SEDES.LEER']);
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { listar } = consultador;
    expect(listar).toHaveBeenCalledWith({
      usuarioId: 'usuario-123',
      rolId: 'rol-director',
      institucionId: 'inst-456',
      sedeId: 'sede-789',
    });
  });
});

describe('Claves de metadata de decoradores', () => {
  it('ES_PUBLICO tiene el valor esperado', () => {
    expect(ES_PUBLICO).toBe('ES_PUBLICO');
  });

  it('PERMISOS_REQUERIDOS tiene el valor esperado', () => {
    expect(PERMISOS_REQUERIDOS).toBe('PERMISOS_REQUERIDOS');
  });

  it('@Publico devuelve un decorador aplicable', () => {
    expect(typeof Publico()).toBe('function');
  });

  it('@Permisos devuelve un decorador aplicable', () => {
    expect(typeof Permisos('PERSONAS.LEER')).toBe('function');
  });
});

void CONSULTADOR_PERMISOS_EFECTIVOS;
