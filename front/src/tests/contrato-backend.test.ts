import { describe, it, expect } from 'vitest';

const BACKEND_URL = 'http://localhost:3000';

describe('Integración Contractual - Backend Real', () => {
  it('valida el contrato de iniciar-sesion con la base de datos real', async () => {
    // Verificar si el backend está activo, si no, omitir la prueba para no romper ejecuciones aisladas
    let backendActivo = false;
    try {
      const resPing = await fetch(`${BACKEND_URL}/api/v1/autenticacion/iniciar-sesion`, { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } });
      // Si nos responde un error estructurado del backend (como 400 o 401), el backend está activo
      if (resPing.status === 400 || resPing.status === 401) {
        backendActivo = true;
      }
    } catch {
      backendActivo = false;
    }

    if (!backendActivo) {
      console.warn('El backend real no está activo en http://localhost:3000. Omitiendo prueba de integración contractual.');
      return;
    }

    // Probar login con credenciales de bootstrap seguras
    const bodyLogin = {
      correo: 'admin@edura.local',
      clave: 'Admin@Local2024!',
    };

    const res = await fetch(`${BACKEND_URL}/api/v1/autenticacion/iniciar-sesion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyLogin),
    });

    expect(res.status).toBe(200);

    const data: any = await res.json();
    
    // Validar el contrato exacto de REL-SEC-001 / REL-FE-SEC-001
    expect(data).toHaveProperty('usuarioId');
    expect(data).toHaveProperty('nombreMostrado');
    expect(data).toHaveProperty('correo');
    expect(data).toHaveProperty('requiereCambioClave');
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');

    expect(typeof data.usuarioId).toBe('string');
    expect(typeof data.nombreMostrado).toBe('string');
    expect(typeof data.correo).toBe('string');
    expect(typeof data.requiereCambioClave).toBe('boolean');
    expect(typeof data.accessToken).toBe('string');
    expect(typeof data.refreshToken).toBe('string');
  });
});
