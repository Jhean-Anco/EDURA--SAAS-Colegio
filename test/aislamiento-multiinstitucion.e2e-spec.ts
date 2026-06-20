import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { configurarAplicacion } from '../src/configuracion/configurar-aplicacion';
import { AppModule } from '../src/app.module';

const SKIP_E2E = !process.env['BD_HOST'];
const describeE2E = SKIP_E2E ? describe.skip : describe;

interface ContextoInstitucion {
  institucionId: string;
  usuarioId: string;
  membresiaId: string;
  personaId: string;
  correo: string;
  clave: string;
}

async function crearInstitucionConUsuarioYPersona(
  ds: DataSource,
  sufijo: string,
): Promise<ContextoInstitucion> {
  const institucionId = randomUUID();
  const usuarioId = randomUUID();
  const membresiaId = randomUUID();
  const personaId = randomUUID();
  const correo = `usuario-aislamiento-${sufijo}@test.edura.local`;
  const clave = `Clave${sufijo}@2024!`;

  await ds.transaction(async (manager) => {
    await manager.query(
      `INSERT INTO instituciones_educativas (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'PRIVADA', 'ACTIVA', now(), now())`,
      [
        institucionId,
        `INST-${sufijo}`,
        `Institucion ${sufijo}`,
        `TST-${sufijo}`,
      ],
    );

    const hash = await argon2.hash(clave, { type: argon2.argon2id });
    await manager.query(
      `INSERT INTO usuarios (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
      [usuarioId, correo, correo.toLowerCase(), `Usuario ${sufijo}`],
    );
    await manager.query(
      `INSERT INTO credenciales_usuario (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
       VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())`,
      [usuarioId, hash],
    );

    await manager.query(
      `INSERT INTO membresias_institucion (id, id_usuario, id_institucion_educativa, estado, fecha_inicio, fecha_creacion, fecha_modificacion)
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
      `INSERT INTO asignaciones_rol_usuario (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
       VALUES ($1, $2, $3, $4, NULL, 'ACTIVA', CURRENT_DATE, now())`,
      [randomUUID(), usuarioId, rol.id, membresiaId],
    );

    await manager.query(
      `INSERT INTO personas (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_registral, codigo_pais_nacionalidad, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'Test', $4, '1990-01-01', 'NO_ESPECIFICADO', 'PE', 'ACTIVA', now(), now())`,
      [personaId, institucionId, `Persona ${sufijo}`, sufijo],
    );
  });

  return { institucionId, usuarioId, membresiaId, personaId, correo, clave };
}

async function limpiarInstitucionTest(
  ds: DataSource,
  ctx: ContextoInstitucion,
): Promise<void> {
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
  await ds.query(`DELETE FROM instituciones_educativas WHERE id = $1`, [
    ctx.institucionId,
  ]);
}

describeE2E('Aislamiento multi-institución E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let ds: DataSource;
  let ctxA: ContextoInstitucion;
  let ctxB: ContextoInstitucion;

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modulo.createNestApplication();
    configurarAplicacion(app, true);
    await app.init();
    ds = modulo.get(DataSource);

    ctxA = await crearInstitucionConUsuarioYPersona(ds, 'A');
    ctxB = await crearInstitucionConUsuarioYPersona(ds, 'B');
  });

  afterAll(async () => {
    if (ds) {
      await limpiarInstitucionTest(ds, ctxA).catch(() => undefined);
      await limpiarInstitucionTest(ds, ctxB).catch(() => undefined);
    }
    if (app) {
      await app.close();
    }
  });

  async function obtenerTokenAcceso(
    correo: string,
    clave: string,
    institucionId: string,
  ): Promise<string> {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/autenticacion/iniciar-sesion')
      .send({ correo, clave })
      .expect(201);

    const tokenPrecontexto: string = (loginRes.body as { accessToken: string })
      .accessToken;

    const contextosRes = await request(app.getHttpServer())
      .get('/api/v1/autenticacion/contextos')
      .set('Authorization', `Bearer ${tokenPrecontexto}`)
      .expect(200);

    const listaContextos = contextosRes.body as {
      ambito: string;
      rolId: string;
      rolCodigo: string;
      institucionId: string | null;
      sedeId: string | null;
    }[];
    const contexto = listaContextos.find(
      (item) =>
        item.ambito === 'INSTITUCION' &&
        item.institucionId === institucionId &&
        item.sedeId === null,
    );
    if (!contexto) {
      throw new Error(
        `No se encontro contexto institucional para ${correo}: ${JSON.stringify(listaContextos)}`,
      );
    }

    const contextoRes = await request(app.getHttpServer())
      .post('/api/v1/autenticacion/seleccionar-contexto')
      .set('Authorization', `Bearer ${tokenPrecontexto}`)
      .send(contexto)
      .expect(201);

    return (contextoRes.body as { accessToken: string }).accessToken;
  }

  it('usuario de institución A puede listar sus propias personas', async () => {
    const token = await obtenerTokenAcceso(
      ctxA.correo,
      ctxA.clave,
      ctxA.institucionId,
    );

    const res = await request(app.getHttpServer())
      .get('/api/v1/personas')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const ids = (res.body as { datos: { id: string }[] }).datos.map(
      (persona) => persona.id,
    );
    expect(ids).toContain(ctxA.personaId);
  });

  it('usuario de institución A NO puede ver la persona de institución B en el listado', async () => {
    const token = await obtenerTokenAcceso(
      ctxA.correo,
      ctxA.clave,
      ctxA.institucionId,
    );

    const res = await request(app.getHttpServer())
      .get('/api/v1/personas')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const ids = (res.body as { datos: { id: string }[] }).datos.map(
      (persona) => persona.id,
    );
    expect(ids).not.toContain(ctxB.personaId);
  });

  it('usuario de institución A obtiene 404 al intentar acceder a persona de institución B por ID', async () => {
    const token = await obtenerTokenAcceso(
      ctxA.correo,
      ctxA.clave,
      ctxA.institucionId,
    );

    await request(app.getHttpServer())
      .get(`/api/v1/personas/${ctxB.personaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('usuario de institución B puede ver su persona pero no la de institución A', async () => {
    const token = await obtenerTokenAcceso(
      ctxB.correo,
      ctxB.clave,
      ctxB.institucionId,
    );

    const res = await request(app.getHttpServer())
      .get('/api/v1/personas')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const ids = (res.body as { datos: { id: string }[] }).datos.map(
      (persona) => persona.id,
    );
    expect(ids).toContain(ctxB.personaId);
    expect(ids).not.toContain(ctxA.personaId);
  });

  it('sin token retorna 401 en endpoint de personas', async () => {
    await request(app.getHttpServer()).get('/api/v1/personas').expect(401);
  });

  it('token de institución A con id de persona de B en URL retorna 404', async () => {
    const token = await obtenerTokenAcceso(
      ctxA.correo,
      ctxA.clave,
      ctxA.institucionId,
    );

    await request(app.getHttpServer())
      .get(`/api/v1/personas/${ctxB.personaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
