import { describe, it, expect } from 'vitest';
import { esquemaCrearPlan, esquemaDuplicarPlan } from '../plan.schema';

describe('esquemaCrearPlan', () => {
  const valido = {
    idAnioAcademico: '550e8400-e29b-41d4-a716-446655440000',
    idGradoEducativo: '550e8400-e29b-41d4-a716-446655440001',
    codigo: 'PE-2025',
    nombre: 'Plan de estudios 2025',
    observacion: null,
  };

  it('acepta datos válidos', () => {
    expect(esquemaCrearPlan.safeParse(valido).success).toBe(true);
  });

  it('rechaza UUID inválido en idAnioAcademico', () => {
    const r = esquemaCrearPlan.safeParse({ ...valido, idAnioAcademico: 'no-uuid' });
    expect(r.success).toBe(false);
  });

  it('rechaza código vacío', () => {
    const r = esquemaCrearPlan.safeParse({ ...valido, codigo: '' });
    expect(r.success).toBe(false);
  });

  it('rechaza nombre vacío', () => {
    const r = esquemaCrearPlan.safeParse({ ...valido, nombre: '' });
    expect(r.success).toBe(false);
  });

  it('rechaza código mayor a 40 caracteres', () => {
    const r = esquemaCrearPlan.safeParse({ ...valido, codigo: 'A'.repeat(41) });
    expect(r.success).toBe(false);
  });

  it('transforma null en observacion a null', () => {
    const r = esquemaCrearPlan.safeParse({ ...valido, observacion: null });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.observacion).toBeNull();
  });

  it('transforma observacion undefined a null', () => {
    const r = esquemaCrearPlan.safeParse({ ...valido, observacion: undefined });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.observacion).toBeNull();
  });
});

describe('esquemaDuplicarPlan', () => {
  it('acepta sin idAnioAcademico (es opcional)', () => {
    const r = esquemaDuplicarPlan.safeParse({
      codigo: 'PE-2025-V2',
      nombre: 'Plan duplicado',
    });
    expect(r.success).toBe(true);
  });

  it('rechaza UUID inválido en idAnioAcademico cuando se provee', () => {
    const r = esquemaDuplicarPlan.safeParse({
      idAnioAcademico: 'no-uuid',
      codigo: 'PE-2025-V2',
      nombre: 'Plan duplicado',
    });
    expect(r.success).toBe(false);
  });
});
