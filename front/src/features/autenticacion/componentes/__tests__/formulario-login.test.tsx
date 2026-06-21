import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/tests/test-utils';
import { FormularioLogin } from '../formulario-login';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function getPasswordInput(): HTMLElement {
  return screen.getByPlaceholderText('••••••••');
}

describe('FormularioLogin', () => {
  it('renderiza campo email y campo contraseña', () => {
    render(<FormularioLogin />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
  });

  it('muestra error de validación si el email está vacío al enviar', async () => {
    render(<FormularioLogin />);
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText(/correo es obligatorio/i)).toBeInTheDocument();
    });
  });

  it('muestra error si el email tiene formato inválido', async () => {
    render(<FormularioLogin />);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'no-es-email');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText(/correo válido/i)).toBeInTheDocument();
    });
  });

  it('muestra error de validación si la contraseña está vacía', async () => {
    render(<FormularioLogin />);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'user@test.com');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText(/contraseña es obligatoria/i)).toBeInTheDocument();
    });
  });

  it('toggle de visibilidad de contraseña funciona', async () => {
    render(<FormularioLogin />);
    const input = getPasswordInput();
    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: /mostrar contraseña/i }));
    expect(input).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByRole('button', { name: /ocultar contraseña/i }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('redirige a /seleccionar-contexto al login exitoso', async () => {
    render(<FormularioLogin />);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'admin@edura.pe');
    await userEvent.type(getPasswordInput(), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/seleccionar-contexto');
    });
  });

  it('muestra error de credenciales al login fallido', async () => {
    render(<FormularioLogin />);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'malo@test.com');
    await userEvent.type(getPasswordInput(), 'contraseñamala123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('botón pasa a estado de carga al enviar', async () => {
    render(<FormularioLogin />);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'admin@edura.pe');
    await userEvent.type(getPasswordInput(), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/seleccionar-contexto');
    });
  });

  it('campo email tiene autocomplete email', () => {
    render(<FormularioLogin />);
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('autocomplete', 'email');
  });
});
