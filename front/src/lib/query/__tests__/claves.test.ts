import { describe, it, expect } from 'vitest';
import { claves } from '../claves';

const ctx = { institucionId: 'inst-001', ambito: 'INSTITUCION' as const, sedeId: null };

describe('claves de query', () => {
  it('contextos tiene clave estable', () => {
    expect(claves.autenticacion.contextos()).toEqual(['autenticacion', 'contextos']);
  });

  it('panel.resumen incluye el contexto', () => {
    const clave = claves.panel.resumen(ctx);
    expect(clave).toContain('panel');
    expect(clave).toContainEqual(ctx);
  });

  it('dos contextos distintos generan claves distintas', () => {
    const ctx2 = { ...ctx, sedeId: 'sede-001', ambito: 'SEDE' as const };
    expect(claves.panel.resumen(ctx)).not.toEqual(claves.panel.resumen(ctx2));
  });

  it('panel.todos es prefijo de panel.resumen', () => {
    const todos = claves.panel.todos(ctx);
    const resumen = claves.panel.resumen(ctx);
    expect(resumen.slice(0, todos.length)).toEqual(todos);
  });
});
