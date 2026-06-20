import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  validarInstitucionDelContexto,
  validarSedeDelContexto,
} from '../../src/compartido/presentacion/http/validacion-contexto-http';
import { normalizarPaginacion } from '../../src/compartido/aplicacion/paginacion';
import { ContextoSolicitudAutenticada } from '../../src/compartido/aplicacion/contexto-solicitud-autenticada';

describe('Paginacion', () => {
  it('rechaza valores invalidos', () => {
    expect(() => normalizarPaginacion({ pagina: 'abc', tamano: 10 })).toThrow(
      'PARAMETROS_DE_PAGINACION_INVALIDOS',
    );
    expect(() => normalizarPaginacion({ pagina: 1, tamano: 101 })).toThrow(
      'PARAMETROS_DE_PAGINACION_INVALIDOS',
    );
  });

  it('normaliza enteros validos', () => {
    expect(normalizarPaginacion({ pagina: '2', tamano: '25' })).toEqual({
      pagina: 2,
      tamano: 25,
    });
  });
});

describe('Contexto', () => {
  const contextoSede = {
    tipoToken: 'ACCESO',
    ambito: 'SEDE',
    institucionId: 'inst-1',
    sedeId: 'sede-1',
  } as ContextoSolicitudAutenticada;

  it('rechaza contexto ausente para institucion', () => {
    expect(() => validarInstitucionDelContexto(undefined, 'inst-1')).toThrow(
      ForbiddenException,
    );
  });

  it('rechaza acceso a sede ajena como no encontrada', () => {
    expect(() =>
      validarSedeDelContexto(contextoSede, 'inst-1', 'sede-2'),
    ).toThrow(NotFoundException);
  });
});
