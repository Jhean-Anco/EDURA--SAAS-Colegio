import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/server';
import { render } from '@/tests/test-utils';
import { TablaPlanes } from '../componentes/tabla-planes';
import { BadgeEstadoPlan } from '../componentes/badge-estado-plan';
import type { PlanEstudioItem } from '@/types/curriculo';

const planBase: PlanEstudioItem = {
  id: 'plan-001',
  codigo: 'PE-2025-1PRI',
  nombre: 'Plan de estudios 1er grado 2025',
  version: 1,
  estado: 'BORRADOR',
  idAnioAcademico: 'anio-2025',
  anio: 2025,
  idGradoEducativo: 'grado-1pri',
  nombreGrado: '1er Grado',
  nombreNivel: 'Primaria',
};

// ── BadgeEstadoPlan ─────────────────────────────────────────────────────────

describe('BadgeEstadoPlan', () => {
  it.each([
    ['BORRADOR', 'Borrador'],
    ['APROBADO', 'Aprobado'],
    ['VIGENTE', 'Vigente'],
    ['CERRADO', 'Cerrado'],
    ['ANULADO', 'Anulado'],
  ] as const)('renderiza etiqueta "%s"', (estado, etiqueta) => {
    render(<BadgeEstadoPlan estado={estado} />);
    expect(screen.getByText(etiqueta)).toBeDefined();
  });
});

// ── TablaPlanes ─────────────────────────────────────────────────────────────

describe('TablaPlanes', () => {
  it('muestra skeletons cuando carga', () => {
    const { container } = render(
      <TablaPlanes
        planes={[]}
        cargando
        puedeGestionar={false}
        onDuplicar={() => undefined}
      />,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('muestra el nombre del plan como enlace al detalle', () => {
    render(
      <TablaPlanes
        planes={[planBase]}
        cargando={false}
        puedeGestionar={false}
        onDuplicar={() => undefined}
      />,
    );
    expect(screen.getByText('Plan de estudios 1er grado 2025')).toBeDefined();
  });

  it('muestra botón Editar solo en BORRADOR con puedeGestionar=true', async () => {
    render(
      <TablaPlanes
        planes={[planBase]}
        cargando={false}
        puedeGestionar={true}
        onDuplicar={() => undefined}
      />,
    );
    const user = userEvent.setup();
    const acciones = screen.getByRole('button', { name: /acciones para/i });
    await user.click(acciones);
    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeDefined();
    });
  });

  it('NO muestra botón Editar para plan APROBADO', async () => {
    const planAprobado = { ...planBase, estado: 'APROBADO' as const };
    render(
      <TablaPlanes
        planes={[planAprobado]}
        cargando={false}
        puedeGestionar={true}
        onDuplicar={() => undefined}
      />,
    );
    const user = userEvent.setup();
    const acciones = screen.getByRole('button', { name: /acciones para/i });
    await user.click(acciones);
    await waitFor(() => {
      expect(screen.queryByText('Editar')).toBeNull();
    });
  });

  it('llama onDuplicar al hacer click en Duplicar', async () => {
    let duplicado: PlanEstudioItem | null = null;
    render(
      <TablaPlanes
        planes={[planBase]}
        cargando={false}
        puedeGestionar={true}
        onDuplicar={(p) => { duplicado = p; }}
      />,
    );
    const user = userEvent.setup();
    const acciones = screen.getByRole('button', { name: /acciones para/i });
    await user.click(acciones);
    const btn = await screen.findByText('Duplicar');
    await user.click(btn);
    expect(duplicado).not.toBeNull();
  });
});

// ── Flujo errores HTTP con MSW ───────────────────────────────────────────────

describe('manejo de errores HTTP con MSW', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('handler BFF devuelve 409 con estructura de error correcta', async () => {
    server.use(
      http.post('/api/panel/curriculo/planes', () => {
        return HttpResponse.json(
          {
            codigo: 'CODIGO_DUPLICADO',
            correlacionId: 'corr-test',
            mensaje: 'Ya existe un plan con ese código en la institución',
            ruta: '/api/v1/curriculo/planes',
            fecha: new Date().toISOString(),
          },
          { status: 409 },
        );
      }),
    );

    const res = await fetch('/api/panel/curriculo/planes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'test' },
      body: JSON.stringify({ codigo: 'DUPLICADO' }),
    });

    expect(res.status).toBe(409);
    const json = await res.json() as { codigo: string };
    expect(json.codigo).toBe('CODIGO_DUPLICADO');
  });

  it('handler BFF devuelve 422 con campo inválido', async () => {
    server.use(
      http.post('/api/panel/curriculo/planes', () => {
        return HttpResponse.json(
          {
            codigo: 'ENTIDAD_NO_PROCESABLE',
            correlacionId: 'corr-422',
            mensaje: 'Datos inválidos',
            ruta: '/api/v1/curriculo/planes',
            fecha: new Date().toISOString(),
          },
          { status: 422 },
        );
      }),
    );

    const res = await fetch('/api/panel/curriculo/planes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'test' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(422);
  });

  it('handler BFF devuelve 403 para operación sin permiso', async () => {
    server.use(
      http.post('/api/panel/curriculo/planes/:id/aprobar', () => {
        return HttpResponse.json(
          {
            codigo: 'ACCESO_DENEGADO',
            correlacionId: 'corr-403',
            mensaje: 'No tienes permisos',
            ruta: '/api/v1/curriculo/planes/plan-001/aprobar',
            fecha: new Date().toISOString(),
          },
          { status: 403 },
        );
      }),
    );

    const res = await fetch('/api/panel/curriculo/planes/plan-001/aprobar', {
      method: 'POST',
      headers: { 'X-CSRF-Token': 'test' },
    });

    expect(res.status).toBe(403);
  });
});
