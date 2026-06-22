import { describe, it, expect } from 'vitest';
import { resolverNavegacion, resolverNavegacionPlana, REGISTRO_NAVEGACION } from '../registro';
import type { ContextoDescriptor } from '@/types/auth';

const contextoBase: ContextoDescriptor = {
  institucionId: 'inst-001',
  institucionNombre: 'I.E. San Pedro',
  ambito: 'INSTITUCION',
  sedeId: null,
  sedeNombre: null,
  permisos: ['PANEL_INSTITUCIONAL.RESUMEN.LEER', 'CURRICULO.LEER', 'CURRICULO.PLANES.GESTIONAR'],
  rolId: 'rol-id-test',
  rolCodigo: 'ADMINISTRADOR_INSTITUCION',
};


describe('REGISTRO_NAVEGACION (plano)', () => {
  it('contiene al menos el item panel', () => {
    const panel = REGISTRO_NAVEGACION.find((i) => i.codigo === 'panel');
    expect(panel).toBeDefined();
    expect(panel?.ruta).toBe('/panel');
  });

  it('contiene item de planes de estudio', () => {
    const planes = REGISTRO_NAVEGACION.find((i) => i.codigo === 'curriculo-planes');
    expect(planes).toBeDefined();
  });
});

describe('resolverNavegacion (grupos)', () => {
  it('devuelve grupos con items para contexto INSTITUCION con permisos', () => {
    const grupos = resolverNavegacion(contextoBase);
    expect(grupos.length).toBeGreaterThan(0);
    const todosItems = grupos.flatMap((g) => g.items);
    expect(todosItems.some((i) => i.codigo === 'panel')).toBe(true);
  });

  it('incluye grupo Currículo cuando hay CURRICULO.LEER', () => {
    const grupos = resolverNavegacion(contextoBase);
    const curriculum = grupos.find((g) => g.etiqueta === 'Currículo');
    expect(curriculum).toBeDefined();
    expect(curriculum?.items.length).toBeGreaterThan(0);
  });

  it('no incluye Currículo sin permiso CURRICULO.LEER', () => {
    const sinCurriculo: ContextoDescriptor = {
      ...contextoBase,
      permisos: ['PANEL_INSTITUCIONAL.RESUMEN.LEER'],
    };
    const grupos = resolverNavegacion(sinCurriculo);
    const curriculum = grupos.find((g) => g.etiqueta === 'Currículo');
    expect(curriculum).toBeUndefined();
  });

  it('excluye grupos vacíos cuando faltan permisos', () => {
    const sinPermisos: ContextoDescriptor = { ...contextoBase, permisos: [] };
    const grupos = resolverNavegacion(sinPermisos);
    grupos.forEach((g) => expect(g.items.length).toBeGreaterThan(0));
    const totalItems = grupos.flatMap((g) => g.items);
    expect(totalItems).toHaveLength(0);
  });

  it('no retorna panel para contexto SEDE sin permiso de SEDE', () => {
    const sede: ContextoDescriptor = {
      ...contextoBase,
      ambito: 'SEDE',
      sedeId: 'sede-001',
      sedeNombre: 'Sede Norte',
    };
    const grupos = resolverNavegacion(sede);
    const items = grupos.flatMap((g) => g.items);
    // Currículo requiere ámbito INSTITUCION
    expect(items.some((i) => i.codigo === 'curriculo-planes')).toBe(false);
  });
});

describe('resolverNavegacionPlana', () => {
  it('devuelve array plano de NavItem', () => {
    const items = resolverNavegacionPlana(contextoBase);
    expect(Array.isArray(items)).toBe(true);
    items.forEach((item) => {
      expect(item.icono).toBeDefined();
      expect(item.ruta).toMatch(/^\//);
      expect(item.etiqueta.length).toBeGreaterThan(0);
    });
  });
});
