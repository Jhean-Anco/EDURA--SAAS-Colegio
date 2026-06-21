import { describe, it, expect } from 'vitest';
import { resolverNavegacion, REGISTRO_NAVEGACION } from '../registro';
import type { ContextoDescriptor } from '@/types/auth';

const contextoBase: ContextoDescriptor = {
  institucionId: 'inst-001',
  nombreInstitucion: 'I.E. San Pedro',
  ambito: 'INSTITUCION',
  sedeId: null,
  nombreSede: null,
  permisos: ['PANEL_INSTITUCIONAL.RESUMEN.LEER'],
  roles: ['DIRECTIVO'],
};

describe('REGISTRO_NAVEGACION', () => {
  it('contiene al menos el item panel', () => {
    const panel = REGISTRO_NAVEGACION.find((i) => i.codigo === 'panel');
    expect(panel).toBeDefined();
    expect(panel?.ruta).toBe('/panel');
  });
});

describe('resolverNavegacion', () => {
  it('retorna panel para contexto INSTITUCION con permiso correcto', () => {
    const items = resolverNavegacion(contextoBase);
    expect(items.some((i) => i.codigo === 'panel')).toBe(true);
  });

  it('retorna panel para contexto SEDE con permiso correcto', () => {
    const contextoSede: ContextoDescriptor = {
      ...contextoBase,
      ambito: 'SEDE',
      sedeId: 'sede-001',
      nombreSede: 'Sede Norte',
    };
    const items = resolverNavegacion(contextoSede);
    expect(items.some((i) => i.codigo === 'panel')).toBe(true);
  });

  it('no retorna items si faltan permisos', () => {
    const sinPermisos: ContextoDescriptor = { ...contextoBase, permisos: [] };
    const items = resolverNavegacion(sinPermisos);
    const panel = items.find((i) => i.codigo === 'panel');
    expect(panel).toBeUndefined();
  });

  it('retorna array vacío para contexto sin permisos', () => {
    const sinPermisos: ContextoDescriptor = { ...contextoBase, permisos: [] };
    const items = resolverNavegacion(sinPermisos);
    expect(items).toHaveLength(0);
  });

  it('cada item tiene icono, ruta, y etiqueta definidos', () => {
    const items = resolverNavegacion(contextoBase);
    items.forEach((item) => {
      expect(item.icono).toBeDefined();
      expect(item.ruta).toMatch(/^\//);
      expect(item.etiqueta.length).toBeGreaterThan(0);
    });
  });
});
