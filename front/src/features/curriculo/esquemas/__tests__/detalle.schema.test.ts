import { describe, it, expect } from 'vitest';
import { esquemaAgregarDetalle } from '../detalle.schema';

describe('esquemaAgregarDetalle', () => {
  const valido = {
    idAsignatura: '550e8400-e29b-41d4-a716-446655440000',
    tipo: 'OBLIGATORIA' as const,
    horasSemanales: 4,
    horasAnuales: 160,
    orden: 1,
    observacion: null,
  };

  it('acepta datos válidos', () => {
    expect(esquemaAgregarDetalle.safeParse(valido).success).toBe(true);
  });

  it('rechaza horasSemanales menor a 1', () => {
    expect(esquemaAgregarDetalle.safeParse({ ...valido, horasSemanales: 0 }).success).toBe(false);
  });

  it('rechaza horasAnuales menor a 1', () => {
    expect(esquemaAgregarDetalle.safeParse({ ...valido, horasAnuales: 0 }).success).toBe(false);
  });

  it('rechaza orden menor a 1', () => {
    expect(esquemaAgregarDetalle.safeParse({ ...valido, orden: 0 }).success).toBe(false);
  });

  it('rechaza tipo inválido', () => {
    expect(
      esquemaAgregarDetalle.safeParse({ ...valido, tipo: 'OPCIONAL' }).success,
    ).toBe(false);
  });

  it('acepta tipo ELECTIVA', () => {
    expect(
      esquemaAgregarDetalle.safeParse({ ...valido, tipo: 'ELECTIVA' }).success,
    ).toBe(true);
  });

  it('rechaza UUID inválido en idAsignatura', () => {
    expect(
      esquemaAgregarDetalle.safeParse({ ...valido, idAsignatura: 'no-uuid' }).success,
    ).toBe(false);
  });
});
