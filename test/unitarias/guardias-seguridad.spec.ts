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

function crearContexto(
  contextoActual: ContextoSolicitudAutenticada,
): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ contextoActual }),
    }),
  } as unknown as ExecutionContext;
}

describe('GuardiaPermisos', () => {
  let consultador: jest.Mocked<ConsultadorPermisosEfectivos>;
  let reflector: Reflector;

  beforeEach(() => {
    consultador = { listar: jest.fn() };
    reflector = new Reflector();
  });

  it('omite autorizacion cuando no hay permisos declarados', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const guardia = new GuardiaPermisos(reflector, consultador);
    await expect(
      guardia.canActivate(crearContexto({} as ContextoSolicitudAutenticada)),
    ).resolves.toBe(true);
  });

  it('rechaza cuando falta un permiso requerido', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['PERSONAS.CREAR']);
    consultador.listar.mockResolvedValue(['PERSONAS.LEER']);
    const guardia = new GuardiaPermisos(reflector, consultador);
    await expect(
      guardia.canActivate(
        crearContexto({
          tipoToken: 'ACCESO',
          ambito: 'INSTITUCION',
          rolId: 'rol-1',
          usuarioId: 'usuario-1',
          institucionId: 'inst-1',
          sedeId: null,
        } as ContextoSolicitudAutenticada),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('consulta permisos con el contexto autenticado completo', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SEDES.LEER']);
    consultador.listar.mockResolvedValue(['SEDES.LEER']);
    const guardia = new GuardiaPermisos(reflector, consultador);
    await expect(
      guardia.canActivate(
        crearContexto({
          tipoToken: 'ACCESO',
          ambito: 'SEDE',
          rolId: 'rol-director',
          usuarioId: 'usuario-123',
          institucionId: 'inst-456',
          sedeId: 'sede-789',
        } as ContextoSolicitudAutenticada),
      ),
    ).resolves.toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(consultador.listar).toHaveBeenCalledWith({
      usuarioId: 'usuario-123',
      rolId: 'rol-director',
      institucionId: 'inst-456',
      sedeId: 'sede-789',
    });
  });
});

describe('Decoradores de seguridad', () => {
  it('Publico marca metadata de acceso libre', () => {
    class ControladorPrueba {
      @Publico()
      metodo(): void {}
    }

    const metodo: unknown = Object.getOwnPropertyDescriptor(
      ControladorPrueba.prototype,
      'metodo',
    )?.value;
    expect(Reflect.getMetadata(ES_PUBLICO, metodo)).toBe(true);
  });

  it('Permisos guarda la lista de permisos requeridos', () => {
    class ControladorPrueba {
      @Permisos('PERSONAS.LEER', 'PERSONAS.CREAR')
      metodo(): void {}
    }

    const metodo: unknown = Object.getOwnPropertyDescriptor(
      ControladorPrueba.prototype,
      'metodo',
    )?.value;
    expect(Reflect.getMetadata(PERMISOS_REQUERIDOS, metodo)).toEqual([
      'PERSONAS.LEER',
      'PERSONAS.CREAR',
    ]);
  });
});

void CONSULTADOR_PERMISOS_EFECTIVOS;
