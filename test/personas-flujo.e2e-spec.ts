import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { configurarAplicacion } from '../src/configuracion/configurar-aplicacion';
import { AppModule } from '../src/app.module';

interface ContextoTenant {
  institucionId: string;
  usuarioId: string;
  membresiaId: string;
  personaId: string;
  correo: string;
  clave: string;
}

async function crearTenant(
  ds: DataSource,
  sufijo: string,
): Promise<ContextoTenant> {
  const institucionId = randomUUID();
  const usuarioId = randomUUID();
  const membresiaId = randomUUID();
  const personaId = randomUUID();
  const correo = `usuario-${sufijo.toLowerCase()}-${randomUUID()}@test.edura.local`;
  const clave = `Clave${sufijo}@2026!`;
  const hash = await argon2.hash(clave, { type: argon2.argon2id });

  await ds.transaction(async (manager) => {
    await manager.query(
      `INSERT INTO instituciones_educativas
        (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'PRIVADA', 'ACTIVA', now(), now())`,
      [
        institucionId,
        `EDURA-${sufijo}`,
        `Institucion ${sufijo}`,
        `INST-${sufijo}`,
      ],
    );
    await manager.query(
      `INSERT INTO usuarios
        (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
      [usuarioId, correo, correo.toLowerCase(), `Usuario ${sufijo}`],
    );
    await manager.query(
      `INSERT INTO credenciales_usuario
        (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
       VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())`,
      [usuarioId, hash],
    );
    await manager.query(
      `INSERT INTO membresias_institucion
        (id, id_usuario, id_institucion_educativa, estado, fecha_inicio, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'ACTIVA', CURRENT_DATE, now(), now())`,
      [membresiaId, usuarioId, institucionId],
    );
    const [rol] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_INSTITUCION' LIMIT 1`,
    );
    if (!rol) {
      throw new Error('No existe el rol ADMINISTRADOR_INSTITUCION');
    }
    await manager.query(
      `INSERT INTO asignaciones_rol_usuario
        (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
       VALUES ($1, $2, $3, $4, NULL, 'ACTIVA', CURRENT_DATE, now())`,
      [randomUUID(), usuarioId, rol.id, membresiaId],
    );
    await manager.query(
      `INSERT INTO personas
        (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_registral, codigo_pais_nacionalidad, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'Perez', 'Lopez', '1990-01-01', 'NO_ESPECIFICADO', 'PE', 'ACTIVA', now(), now())`,
      [personaId, institucionId, `Persona ${sufijo}`],
    );
  });

  return { institucionId, usuarioId, membresiaId, personaId, correo, clave };
}

async function limpiarTenant(
  ds: DataSource,
  ctx: ContextoTenant,
): Promise<void> {
  await ds.query(`DELETE FROM personas WHERE id = $1`, [ctx.personaId]);
  await ds.query(
    `DELETE FROM asignaciones_rol_usuario WHERE id_membresia_institucion = $1`,
    [ctx.membresiaId],
  );
  await ds.query(`DELETE FROM membresias_institucion WHERE id = $1`, [
    ctx.membresiaId,
  ]);
  await ds.query(`DELETE FROM credenciales_usuario WHERE id_usuario = $1`, [
    ctx.usuarioId,
  ]);
  await ds.query(`DELETE FROM sesiones_usuario WHERE id_usuario = $1`, [
    ctx.usuarioId,
  ]);
  await ds.query(`DELETE FROM usuarios WHERE id = $1`, [ctx.usuarioId]);
  await ds.query(`DELETE FROM instituciones_educativas WHERE id = $1`, [
    ctx.institucionId,
  ]);
}

describe('Flujo personas E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let ds: DataSource;
  let tenantA: ContextoTenant;
  let tenantB: ContextoTenant;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacion(app, true);
    await app.init();
    ds = moduleFixture.get(DataSource);

    tenantA = await crearTenant(ds, 'A');
    tenantB = await crearTenant(ds, 'B');
  });

  afterAll(async () => {
    if (ds) {
      await limpiarTenant(ds, tenantA).catch(() => undefined);
      await limpiarTenant(ds, tenantB).catch(() => undefined);
    }
    if (app) {
      await app.close();
    }
  });

  async function obtenerTokenConContexto(
    correo: string,
    clave: string,
  ): Promise<string> {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/autenticacion/iniciar-sesion')
      .send({ correo, clave })
      .expect(201);

    const tokenPrecontexto = (loginRes.body as { accessToken: string })
      .accessToken;
    const contextosRes = await request(app.getHttpServer())
      .get('/api/v1/autenticacion/contextos')
      .set('Authorization', `Bearer ${tokenPrecontexto}`)
      .expect(200);

    const listaContextos = contextosRes.body as {
      ambito: string;
      institucionId: string | null;
      sedeId: string | null;
    }[];
    const contexto = listaContextos.find(
      (item) =>
        item.ambito === 'INSTITUCION' &&
        item.institucionId !== null &&
        item.sedeId === null,
    );
    if (!contexto) {
      throw new Error(
        `No se encontro contexto institucional: ${JSON.stringify(listaContextos)}`,
      );
    }

    const contextoRes = await request(app.getHttpServer())
      .post('/api/v1/autenticacion/seleccionar-contexto')
      .set('Authorization', `Bearer ${tokenPrecontexto}`)
      .send(contexto)
      .expect(201);

    return (contextoRes.body as { accessToken: string }).accessToken;
  }

  it('GET /api/v1/salud retorna 200', async () => {
    await request(app.getHttpServer()).get('/api/v1/salud').expect(200);
  });

  it('endpoint protegido sin token retorna 401', async () => {
    await request(app.getHttpServer()).get('/api/v1/personas').expect(401);
  });

  it('aislamiento multi-institución: token de institución A no puede ver personas de B', async () => {
    const tokenA = await obtenerTokenConContexto(tenantA.correo, tenantA.clave);
    const tokenB = await obtenerTokenConContexto(tenantB.correo, tenantB.clave);

    const listadoA = await request(app.getHttpServer())
      .get('/api/v1/personas')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    const idsA = (listadoA.body as { datos: { id: string }[] }).datos.map(
      (item) => item.id,
    );
    expect(idsA).toContain(tenantA.personaId);
    expect(idsA).not.toContain(tenantB.personaId);

    const listadoB = await request(app.getHttpServer())
      .get('/api/v1/personas')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    const idsB = (listadoB.body as { datos: { id: string }[] }).datos.map(
      (item) => item.id,
    );
    expect(idsB).toContain(tenantB.personaId);
    expect(idsB).not.toContain(tenantA.personaId);
  });

  it('token de institución A con id de persona de B en URL retorna 404', async () => {
    const tokenA = await obtenerTokenConContexto(tenantA.correo, tenantA.clave);
    await request(app.getHttpServer())
      .get(`/api/v1/personas/${tenantB.personaId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
  });

  it('token inválido retorna 401', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/personas/consultas/dni')
      .set('Authorization', 'Bearer token-invalido')
      .send({ numeroDni: '12345678' })
      .expect(401);
  });
});
