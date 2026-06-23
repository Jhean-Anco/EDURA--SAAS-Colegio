import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configurarAplicacion } from '../src/configuracion/configurar-aplicacion';

const SKIP_E2E = !process.env['BD_HOST'];
const describeE2E = SKIP_E2E ? describe.skip : describe;

describeE2E('Seguridad OWASP / ASVS E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let ds: DataSource;

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modulo.createNestApplication();
    configurarAplicacion(app, { swaggerHabilitado: false } as any);
    await app.init();
    ds = modulo.get(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Bloqueo de cuentas progresivo (lockout)', () => {
    it('debe registrar intentos fallidos y bloquear la cuenta progresivamente', async () => {
      const email = `lockout-${randomUUID()}@test.edura.local`;
      const pass = 'Password@123';
      const userId = randomUUID();
      const hash = await argon2.hash(pass, { type: argon2.argon2id });

      // Create test user
      await ds.transaction(async (manager) => {
        await manager.query(
          `INSERT INTO usuarios (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
           VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
          [userId, email, email.toLowerCase(), 'Lockout User'],
        );
        await manager.query(
          `INSERT INTO credenciales_usuario (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
           VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())`,
          [userId, hash],
        );
      });

      try {
        // Try logging in with wrong password 5 times
        for (let i = 0; i < 5; i++) {
          await request(app.getHttpServer())
            .post('/api/v1/autenticacion/iniciar-sesion')
            .send({ correo: email, clave: 'WrongPassword' })
            .expect(401);
        }

        // Verify database state: intentos_fallidos should be 5, and bloqueado_hasta should be set
        const [cred] = (await ds.query(
          `SELECT intentos_fallidos as "intentosFallidos", bloqueado_hasta as "bloqueadoHasta" 
           FROM credenciales_usuario WHERE id_usuario = $1`,
          [userId],
        )) as { intentosFallidos: number; bloqueadoHasta: string | null }[];

        expect(cred.intentosFallidos).toBe(5);
        expect(cred.bloqueadoHasta).not.toBeNull();
        expect(
          new Date(cred.bloqueadoHasta as string).getTime(),
        ).toBeGreaterThan(Date.now());
      } finally {
        // No deletion to avoid foreign key violations with append-only audit log
      }
    });
  });

  describe('Mitigación de manipulación de JWT', () => {
    it('debe rechazar tokens con firmas manipuladas o inválidas', async () => {
      // Send request with an invalid signature token
      const malformedToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid_signature';
      await request(app.getHttpServer())
        .get('/api/v1/personas')
        .set('Authorization', `Bearer ${malformedToken}`)
        .expect(401);
    });
  });

  describe('Rotación de Refresh Tokens y Detección de Reuso', () => {
    it('debe renovar la sesión correctamente y detectar reuso invalidando toda la familia', async () => {
      const email = `refresh-${randomUUID()}@test.edura.local`;
      const pass = 'Password@123';
      const userId = randomUUID();
      const hash = await argon2.hash(pass, { type: argon2.argon2id });

      // Create test user
      await ds.transaction(async (manager) => {
        await manager.query(
          `INSERT INTO usuarios (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
           VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
          [userId, email, email.toLowerCase(), 'Refresh User'],
        );
        await manager.query(
          `INSERT INTO credenciales_usuario (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
           VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())`,
          [userId, hash],
        );
      });

      try {
        // 1. Initial Login
        const loginRes = await request(app.getHttpServer())
          .post('/api/v1/autenticacion/iniciar-sesion')
          .send({ correo: email, clave: pass })
          .expect(200);

        const r1 = (loginRes.body as { refreshToken?: string }).refreshToken;
        expect(r1).toBeDefined();

        // 2. Rotate once
        const rotRes = await request(app.getHttpServer())
          .post('/api/v1/autenticacion/renovar')
          .send({ refreshToken: r1 })
          .expect(200);

        const r2 = (rotRes.body as { refreshToken?: string }).refreshToken;
        expect(r2).toBeDefined();
        expect(r2).not.toBe(r1);

        // 3. Reuse r1 (should trigger reuse detection, revoke all sessions in family, and fail)
        await request(app.getHttpServer())
          .post('/api/v1/autenticacion/renovar')
          .send({ refreshToken: r1 })
          .expect(401);

        // 4. Try using r2 now (it should also fail since the whole family was revoked)
        await request(app.getHttpServer())
          .post('/api/v1/autenticacion/renovar')
          .send({ refreshToken: r2 })
          .expect(401);
      } finally {
        // No deletion to avoid foreign key violations with append-only audit log
      }
    });
  });
});
