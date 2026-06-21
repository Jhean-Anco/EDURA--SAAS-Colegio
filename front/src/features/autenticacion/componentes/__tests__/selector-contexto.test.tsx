import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/tests/test-utils';
import { SelectorContexto } from '../selector-contexto';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('SelectorContexto', () => {
  it('muestra skeleton mientras carga', () => {
    render(<SelectorContexto />);
    expect(document.querySelectorAll('[class*="animate-pulse"]').length).toBeGreaterThan(0);
  });

  it('renderiza las opciones de contexto', async () => {
    render(<SelectorContexto />);
    await waitFor(() => {
      expect(screen.getAllByText('I.E. San Pedro').length).toBeGreaterThan(0);
    });
  });

  it('muestra badge Institución para contexto INSTITUCION', async () => {
    render(<SelectorContexto />);
    await waitFor(() => {
      expect(screen.getByText('Institución')).toBeInTheDocument();
    });
  });

  it('muestra badge Sede para contexto SEDE', async () => {
    render(<SelectorContexto />);
    await waitFor(() => {
      expect(screen.getByText('Sede')).toBeInTheDocument();
    });
  });

  it('muestra el nombre de la sede en contexto SEDE', async () => {
    render(<SelectorContexto />);
    await waitFor(() => {
      expect(screen.getByText('Sede Principal')).toBeInTheDocument();
    });
  });

  it('redirige a /panel al seleccionar un contexto exitosamente', async () => {
    render(<SelectorContexto />);
    await waitFor(() => {
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
    const botones = screen.getAllByRole('button');
    await userEvent.click(botones[0]!);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/panel');
    });
  });

  it('renderiza dos opciones de contexto (institución y sede)', async () => {
    render(<SelectorContexto />);
    await waitFor(() => {
      const botones = screen.getAllByRole('button');
      expect(botones.length).toBe(2);
    });
  });
});
