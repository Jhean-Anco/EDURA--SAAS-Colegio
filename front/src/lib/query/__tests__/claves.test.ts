import { describe, it, expect } from 'vitest';
import { claves } from '../claves';

const ctx = { institucionId: 'inst-001', ambito: 'INSTITUCION' as const, sedeId: null };
const ctx2 = { ...ctx, institucionId: 'inst-002' };

describe('claves de query — autenticación y panel', () => {
  it('contextos tiene clave estable', () => {
    expect(claves.autenticacion.contextos()).toEqual(['autenticacion', 'contextos']);
  });

  it('panel.resumen incluye el contexto', () => {
    const clave = claves.panel.resumen(ctx);
    expect(clave).toContain('panel');
    expect(clave).toContainEqual(ctx);
  });

  it('dos contextos distintos generan claves distintas', () => {
    const ctxSede = { ...ctx, sedeId: 'sede-001', ambito: 'SEDE' as const };
    expect(claves.panel.resumen(ctx)).not.toEqual(claves.panel.resumen(ctxSede));
  });

  it('panel.todos es prefijo de panel.resumen', () => {
    const todos = claves.panel.todos(ctx);
    const resumen = claves.panel.resumen(ctx);
    expect(resumen.slice(0, todos.length)).toEqual(todos);
  });
});

describe('claves.curriculo', () => {
  it('planes con mismo ctx y filtros produce la misma clave', () => {
    const filtros = { idAnio: 'a1', estado: 'BORRADOR' as const };
    expect(claves.curriculo.planes(ctx, filtros)).toEqual(
      claves.curriculo.planes(ctx, filtros),
    );
  });

  it('planes con distinto ctx produce claves distintas', () => {
    expect(claves.curriculo.planes(ctx)).not.toEqual(claves.curriculo.planes(ctx2));
  });

  it('plan individual incluye el id', () => {
    const clave = claves.curriculo.plan(ctx, 'plan-123');
    expect(clave).toContain('plan-123');
  });

  it('detalles incluyen el idPlan', () => {
    const clave = claves.curriculo.detalles(ctx, 'plan-abc');
    expect(clave).toContain('plan-abc');
    expect(clave).toContain('detalles');
  });

  it('asignaturas con idArea es diferente a sin idArea', () => {
    expect(claves.curriculo.asignaturas(ctx, 'area-1')).not.toEqual(
      claves.curriculo.asignaturas(ctx),
    );
  });
});

describe('claves.estructuraAcademica', () => {
  it('anios con estado es diferente a sin estado', () => {
    expect(claves.estructuraAcademica.anios(ctx, 'ACTIVO')).not.toEqual(
      claves.estructuraAcademica.anios(ctx),
    );
  });

  it('grados con idNivel es diferente a sin idNivel', () => {
    expect(claves.estructuraAcademica.grados(ctx, 'niv-1')).not.toEqual(
      claves.estructuraAcademica.grados(ctx),
    );
  });
});
