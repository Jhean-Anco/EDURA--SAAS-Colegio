import { describe, it, expect } from 'vitest';
import { traducirError, ErrorApi, esSesionExpirada, esAccesoDenegado } from '../traducir-error';
import { MENSAJES_ERROR } from '../codigos';
import type { BackendError } from '@/types/api';

const errorBase: BackendError = {
  codigo: 'CREDENCIALES_INVALIDAS',
  correlacionId: 'corr-001',
  mensaje: 'Credenciales incorrectas',
  ruta: '/api/v1/autenticacion/iniciar-sesion',
  fecha: '2026-06-21T00:00:00Z',
};

describe('traducirError', () => {
  it('devuelve un ErrorApi con el mensaje español mapeado', () => {
    const error = traducirError(errorBase, 401);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.mensajeUsuario).toBe(MENSAJES_ERROR['CREDENCIALES_INVALIDAS']);
    expect(error.statusHttp).toBe(401);
    expect(error.correlacionId).toBe('corr-001');
  });

  it('usa el mensaje fallback para códigos desconocidos', () => {
    const error = traducirError({ ...errorBase, codigo: 'CODIGO_DESCONOCIDO_XYZ' }, 500);
    expect(error.mensajeUsuario).toContain('inesperado');
  });

  it('preserva el código original', () => {
    const error = traducirError(errorBase, 401);
    expect(error.codigo).toBe('CREDENCIALES_INVALIDAS');
  });

  it('nombre de la clase es ErrorApi', () => {
    const error = traducirError(errorBase, 401);
    expect(error.name).toBe('ErrorApi');
  });
});

describe('esSesionExpirada', () => {
  it('devuelve true para ErrorApi con status 401', () => {
    const error = new ErrorApi('SESION_EXPIRADA', 'c', 'msg', 401);
    expect(esSesionExpirada(error)).toBe(true);
  });

  it('devuelve false para otros errores', () => {
    expect(esSesionExpirada(new Error('any'))).toBe(false);
    expect(esSesionExpirada(new ErrorApi('X', 'c', 'msg', 403))).toBe(false);
  });
});

describe('esAccesoDenegado', () => {
  it('devuelve true para ErrorApi con status 403', () => {
    const error = new ErrorApi('ACCESO_DENEGADO', 'c', 'msg', 403);
    expect(esAccesoDenegado(error)).toBe(true);
  });
});
