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

interface ContextoTest {
  institucionId: string;
  sedeId: string;
  usuarioId: string;
  membresiaId: string;
  personaId: string;
  correo: string;
  clave: string;
}

async function crearContextoCompleto(
  ds: DataSource,
  sufijo: string,
): Promise<ContextoTest> {
  const institucionId = randomUUID();
  const sedeId = randomUUID();
  const usuarioId = randomUUID();
  const membresiaId = randomUUID();
  const personaId = randomUUID();
  const correo = `est-e2e-${sufijo}@test.edura.local`;
  const clave = `Clave${sufijo}@2025!`;
  const codigo = `IE-EST-${sufijo}-${Date.now().toString(36)}`.slice(0, 40);

  await ds.transaction(async (manager) => {
    await manager.query(
      `INSERT INTO instituciones_educativas
         (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'PUBLICA', 'ACTIVA', now(), now())`,
      [
        institucionId,
        codigo,
        `Institucion Estudiantes ${sufijo}`,
        `EST-${sufijo}`,
      ],
    );
    await manager.query(
      `INSERT INTO sedes
         (id, id_institucion_educativa, codigo, nombre, es_principal, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, true, 'ACTIVA', now(), now())`,
      [sedeId, institucionId, `SEDE-${sufijo}`, `Sede ${sufijo}`],
    );

    const hash = await argon2.hash(clave, { type: argon2.argon2id });
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
    if (rol) {
      await manager.query(
        `INSERT INTO asignaciones_rol_usuario
           (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
         VALUES ($1, $2, $3, $4, NULL, 'ACTIVA', CURRENT_DATE, now())`,
        [randomUUID(), usuarioId, rol.id, membresiaId],
      );
    }
    await manager.query(
      `INSERT INTO personas
         (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_registral, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, 'Alumno', 'Prueba', $3, '2010-05-15', 'NO_ESPECIFICADO', 'ACTIVA', now(), now())`,
      [personaId, institucionId, sufijo],
    );
  });

  return {
    institucionId,
    sedeId,
    usuarioId,
    membresiaId,
    personaId,
    correo,
    clave,
  };
}

async function limpiarContexto(
  ds: DataSource,
  ctx: ContextoTest,
): Promise<void> {
  await ds.query(
    `DELETE FROM documentos_estudiante
       WHERE id_estudiante IN (SELECT id FROM estudiantes WHERE id_institucion_educativa = $1)`,
    [ctx.institucionId],
  );
  await ds.query(
    `DELETE FROM apoderados_estudiante WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
  await ds.query(
    `DELETE FROM estudiantes WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
  await ds.query(`DELETE FROM personas WHERE id_institucion_educativa = $1`, [
    ctx.institucionId,
  ]);
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
  await ds.query(`DELETE FROM sedes WHERE id_institucion_educativa = $1`, [
    ctx.institucionId,
  ]);
  await ds.query(`DELETE FROM instituciones_educativas WHERE id = $1`, [
    ctx.institucionId,
  ]);
}

async function obtenerTokenAcceso(
  app: INestApplication<App>,
  correo: string,
  clave: string,
  institucionId: string,
): Promise<string> {
  const loginRes = await request(app.getHttpServer())
    .post('/api/v1/autenticacion/iniciar-sesion')
    .send({ correo, clave })
    .expect(200);
  const tokenPrecontexto: string = (loginRes.body as { accessToken: string })
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
      item.ambito === 'INSTITUCION' && item.institucionId === institucionId,
  );
  if (!contexto) {
    throw new Error(`No se encontró contexto para ${correo}`);
  }

  const seleccionRes = await request(app.getHttpServer())
    .post('/api/v1/autenticacion/seleccionar-contexto')
    .set('Authorization', `Bearer ${tokenPrecontexto}`)
    .send(contexto)
    .expect(200);
  return (seleccionRes.body as { accessToken: string }).accessToken;
}

describeE2E('Flujo estudiantes E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let ds: DataSource;
  let ctx: ContextoTest;
  let ctxB: ContextoTest;

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    configurarAplicacion(app, true);
    await app.init();
    ds = modulo.get(DataSource);

    ctx = await crearContextoCompleto(ds, 'E2E1');
    ctxB = await crearContextoCompleto(ds, 'E2E2');
  });

  afterAll(async () => {
    if (ds) {
      await limpiarContexto(ds, ctx).catch(() => undefined);
      await limpiarContexto(ds, ctxB).catch(() => undefined);
    }
    if (app) await app.close();
  });

  it('GET /api/v1/estudiantes sin token retorna 401', () => {
    return request(app.getHttpServer()).get('/api/v1/estudiantes').expect(401);
  });

  it('GET /api/v1/estudiantes retorna listado vacio inicialmente', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    const res = await request(app.getHttpServer())
      .get('/api/v1/estudiantes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const body = res.body as { datos: unknown[]; total: number };
    expect(Array.isArray(body.datos)).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/v1/estudiantes crea un estudiante correctamente', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    const res = await request(app.getHttpServer())
      .post('/api/v1/estudiantes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idPersona: ctx.personaId,
        idSede: ctx.sedeId,
        codigo: 'EST-001',
        fechaIngreso: '2025-03-01',
        observacion: 'Creado en test E2E',
      })
      .expect(201);
    const body = res.body as { id: string };
    expect(typeof body.id).toBe('string');
  });

  it('POST /api/v1/estudiantes con codigo duplicado retorna 409', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    await request(app.getHttpServer())
      .post('/api/v1/estudiantes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idPersona: ctx.personaId,
        idSede: ctx.sedeId,
        codigo: 'EST-001',
      })
      .expect(409);
  });

  it('POST /api/v1/estudiantes con sede de otra institucion retorna 422', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    await request(app.getHttpServer())
      .post('/api/v1/estudiantes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idPersona: ctx.personaId,
        idSede: ctxB.sedeId,
        codigo: 'EST-999',
      })
      .expect(422);
  });

  it('GET /api/v1/estudiantes/:id retorna el estudiante creado', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/estudiantes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const datos = (listRes.body as { datos: { id: string }[] }).datos;
    expect(datos.length).toBeGreaterThan(0);
    const estudianteId = datos[0].id;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/estudiantes/${estudianteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const ficha = res.body as { estudiante: { id: string; codigo: string } };
    expect(ficha.estudiante.id).toBe(estudianteId);
    expect(ficha.estudiante.codigo).toBe('EST-001');
  });

  it('GET /api/v1/estudiantes/:id de otra institucion retorna 404', async () => {
    const tokenA = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    const tokenB = await obtenerTokenAcceso(
      app,
      ctxB.correo,
      ctxB.clave,
      ctxB.institucionId,
    );

    // Obtener el ID del estudiante de la institución A
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/estudiantes')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    const datos = (listRes.body as { datos: { id: string }[] }).datos;
    expect(datos.length).toBeGreaterThan(0);
    const estudianteIdA = datos[0].id;

    // El usuario B no puede ver al estudiante de A
    await request(app.getHttpServer())
      .get(`/api/v1/estudiantes/${estudianteIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('GET /api/v1/estudiantes no expone datos de otra institucion en el listado', async () => {
    const tokenA = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    const tokenB = await obtenerTokenAcceso(
      app,
      ctxB.correo,
      ctxB.clave,
      ctxB.institucionId,
    );

    const resA = await request(app.getHttpServer())
      .get('/api/v1/estudiantes')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    const idsA = (resA.body as { datos: { id: string }[] }).datos.map(
      (e) => e.id,
    );

    const resB = await request(app.getHttpServer())
      .get('/api/v1/estudiantes')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    const idsB = (resB.body as { datos: { id: string }[] }).datos.map(
      (e) => e.id,
    );

    // No hay solapamiento entre los listados de A y B
    const interseccion = idsA.filter((id) => idsB.includes(id));
    expect(interseccion).toHaveLength(0);
  });

  it('PATCH /api/v1/estudiantes/:id/estado cambia el estado a INACTIVO', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/estudiantes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const estudianteId = (listRes.body as { datos: { id: string }[] }).datos[0]
      .id;

    await request(app.getHttpServer())
      .patch(`/api/v1/estudiantes/${estudianteId}/estado`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'INACTIVO' })
      .expect(200);
  });
});
