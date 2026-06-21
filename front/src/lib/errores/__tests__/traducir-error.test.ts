import { describe, it, expect } from 'vitest';
import {
  traducirError,
  traducirBackendError,
  ErrorApi,
  esSesionExpirada,
  esAccesoDenegado,
} from '../traducir-error';
import { ApiError } from '@/lib/bff/cliente';
import { MENSAJES_ERROR, MENSAJE_FALLBACK } from '../codigos';
import type { BackendError } from '@/types/api';

const errorBase: BackendError = {
  codigo: 'CREDENCIALES_INVALIDAS',
  correlacionId: 'corr-001',
  mensaje: 'Credenciales incorrectas',
  ruta: '/api/v1/autenticacion/iniciar-sesion',
  fecha: '2026-06-21T00:00:00Z',
};

describe('traducirBackendError', () => {
  it('devuelve un ErrorApi con el mensaje español mapeado', () => {
    const error = traducirBackendError(errorBase, 401);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.mensajeUsuario).toBe(MENSAJES_ERROR['CREDENCIALES_INVALIDAS']);
    expect(error.statusHttp).toBe(401);
    expect(error.correlacionId).toBe('corr-001');
  });

  it('usa el mensaje fallback para códigos desconocidos', () => {
    const error = traducirBackendError({ ...errorBase, codigo: 'CODIGO_DESCONOCIDO_XYZ' }, 500);
    expect(error.mensajeUsuario).toContain('inesperado');
  });

  it('preserva el código original', () => {
    const error = traducirBackendError(errorBase, 401);
    expect(error.codigo).toBe('CREDENCIALES_INVALIDAS');
  });

  it('nombre de la clase es ErrorApi', () => {
    const error = traducirBackendError(errorBase, 401);
    expect(error.name).toBe('ErrorApi');
  });
});

describe('traducirError (string helper)', () => {
  it('traduce ApiError por código', () => {
    const err = new ApiError('CREDENCIALES_INVALIDAS', '', 'msg', '', '', 401);
    expect(traducirError(err)).toBe(MENSAJES_ERROR['CREDENCIALES_INVALIDAS']);
  });

  it('traduce ErrorApi por código', () => {
    const err = new ErrorApi('PLAN_NO_ENCONTRADO', 'c', 'msg', 404);
    expect(traducirError(err)).toBe(MENSAJES_ERROR['PLAN_NO_ENCONTRADO']);
  });

  it('devuelve mensaje para Error genérico', () => {
    expect(traducirError(new Error('algo salió mal'))).toBe('algo salió mal');
  });

  it('devuelve MENSAJE_FALLBACK para código desconocido', () => {
    const err = new ApiError('CODIGO_RARO_XYZ', '', 'msg', '', '', 500);
    expect(traducirError(err)).toBe(MENSAJE_FALLBACK);
  });

  it('devuelve MENSAJE_FALLBACK para unknown', () => {
    expect(traducirError(null)).toBe(MENSAJE_FALLBACK);
    expect(traducirError('texto')).toBe(MENSAJE_FALLBACK);
  });
});

describe('esSesionExpirada', () => {
  it('devuelve true para ErrorApi con status 401', () => {
    expect(esSesionExpirada(new ErrorApi('SESION_EXPIRADA', 'c', 'msg', 401))).toBe(true);
  });

  it('devuelve true para ApiError con status 401', () => {
    expect(esSesionExpirada(new ApiError('SESION_EXPIRADA', '', 'msg', '', '', 401))).toBe(true);
  });

  it('devuelve false para otros errores', () => {
    expect(esSesionExpirada(new Error('any'))).toBe(false);
    expect(esSesionExpirada(new ErrorApi('X', 'c', 'msg', 403))).toBe(false);
  });
});

describe('esAccesoDenegado', () => {
  it('devuelve true para ErrorApi con status 403', () => {
    expect(esAccesoDenegado(new ErrorApi('ACCESO_DENEGADO', 'c', 'msg', 403))).toBe(true);
  });

  it('devuelve true para ApiError con status 403', () => {
    expect(esAccesoDenegado(new ApiError('ACCESO_DENEGADO', '', 'msg', '', '', 403))).toBe(true);
  });
});
