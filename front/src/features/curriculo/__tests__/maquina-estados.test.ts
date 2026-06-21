import { describe, it, expect } from 'vitest';
import {
  transicionesValidas,
  puedeEditarPlan,
  puedeAprobarPlan,
  TRANSICIONES_PLAN,
} from '@/types/curriculo';

describe('TRANSICIONES_PLAN', () => {
  it('BORRADOR puede ir a ANULADO', () => {
    expect(TRANSICIONES_PLAN.BORRADOR).toContain('ANULADO');
  });

  it('APROBADO puede ir a VIGENTE o ANULADO', () => {
    expect(TRANSICIONES_PLAN.APROBADO).toContain('VIGENTE');
    expect(TRANSICIONES_PLAN.APROBADO).toContain('ANULADO');
  });

  it('VIGENTE puede ir a CERRADO', () => {
    expect(TRANSICIONES_PLAN.VIGENTE).toContain('CERRADO');
  });

  it('CERRADO no tiene transiciones', () => {
    expect(TRANSICIONES_PLAN.CERRADO).toHaveLength(0);
  });

  it('ANULADO no tiene transiciones', () => {
    expect(TRANSICIONES_PLAN.ANULADO).toHaveLength(0);
  });
});

describe('transicionesValidas', () => {
  it('devuelve las transiciones correctas para cada estado', () => {
    expect(transicionesValidas('BORRADOR')).toEqual(TRANSICIONES_PLAN.BORRADOR);
    expect(transicionesValidas('VIGENTE')).toEqual(TRANSICIONES_PLAN.VIGENTE);
    expect(transicionesValidas('CERRADO')).toHaveLength(0);
    expect(transicionesValidas('ANULADO')).toHaveLength(0);
  });
});

describe('puedeEditarPlan', () => {
  it('devuelve true solo para BORRADOR', () => {
    expect(puedeEditarPlan('BORRADOR')).toBe(true);
    expect(puedeEditarPlan('APROBADO')).toBe(false);
    expect(puedeEditarPlan('VIGENTE')).toBe(false);
    expect(puedeEditarPlan('CERRADO')).toBe(false);
    expect(puedeEditarPlan('ANULADO')).toBe(false);
  });
});

describe('puedeAprobarPlan', () => {
  it('devuelve true solo para BORRADOR', () => {
    expect(puedeAprobarPlan('BORRADOR')).toBe(true);
    expect(puedeAprobarPlan('APROBADO')).toBe(false);
    expect(puedeAprobarPlan('VIGENTE')).toBe(false);
  });
});
