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
  sedeBId: string;
  usuarioId: string;
  membresiaId: string;
  personaId: string;
  personaBId: string;
  correo: string;
  clave: string;
}

async function crearContextoCompleto(
  ds: DataSource,
  sufijo: string,
): Promise<ContextoTest> {
  const institucionId = randomUUID();
  const sedeId = randomUUID();
  const sedeBId = randomUUID();
  const usuarioId = randomUUID();
  const membresiaId = randomUUID();
  const personaId = randomUUID();
  const personaBId = randomUUID();
  const correo = `doc-e2e-${sufijo}-${randomUUID().slice(0, 8)}@test.edura.local`;
  const clave = `Clave${sufijo}@2025!`;
  const codigo = `IE-DOC-${sufijo}-${Date.now().toString(36)}`.slice(0, 40);

  await ds.transaction(async (manager) => {
    await manager.query(
      `INSERT INTO instituciones_educativas
         (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'PUBLICA', 'ACTIVA', now(), now())`,
      [
        institucionId,
        codigo,
        `Institucion Docentes ${sufijo}`,
        `DOC-${sufijo}`,
      ],
    );
    await manager.query(
      `INSERT INTO sedes
         (id, id_institucion_educativa, codigo, nombre, es_principal, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, true, 'ACTIVA', now(), now())`,
      [sedeId, institucionId, `SEDE-P-${sufijo}`, `Sede P ${sufijo}`],
    );
    await manager.query(
      `INSERT INTO sedes
         (id, id_institucion_educativa, codigo, nombre, es_principal, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, false, 'ACTIVA', now(), now())`,
      [sedeBId, institucionId, `SEDE-B-${sufijo}`, `Sede B ${sufijo}`],
    );

    const hash = await argon2.hash(clave, { type: argon2.argon2id });
    await manager.query(
      `INSERT INTO usuarios
         (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
      [usuarioId, correo, correo.toLowerCase(), `Usuario Doc ${sufijo}`],
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
       VALUES ($1, $2, 'Docente', 'Prueba', $3, '1985-05-15', 'NO_ESPECIFICADO', 'ACTIVA', now(), now())`,
      [personaId, institucionId, sufijo],
    );
    await manager.query(
      `INSERT INTO personas
         (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_registral, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, 'DocenteB', 'PruebaB', $3, '1990-08-20', 'NO_ESPECIFICADO', 'ACTIVA', now(), now())`,
      [personaBId, institucionId, sufijo],
    );
  });

  return {
    institucionId,
    sedeId,
    sedeBId,
    usuarioId,
    membresiaId,
    personaId,
    personaBId,
    correo,
    clave,
  };
}

async function crearContextoDocente(
  ds: DataSource,
  ctx: ContextoTest,
  idPersonaDocente: string,
  sufijo: string,
): Promise<{ correo: string; clave: string; usuarioId: string }> {
  const correo = `doc-miperfil-${sufijo}-${randomUUID().slice(0, 8)}@test.edura.local`;
  const clave = `ClaveDoc${sufijo}@2025!`;
  const usuarioId = randomUUID();
  const membresiaId = randomUUID();

  await ds.transaction(async (manager) => {
    const hash = await argon2.hash(clave, { type: argon2.argon2id });
    await manager.query(
      `INSERT INTO usuarios
         (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
      [usuarioId, correo, correo.toLowerCase(), `Usuario Docente ${sufijo}`],
    );
    await manager.query(
      `INSERT INTO credenciales_usuario
         (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
       VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())`,
      [usuarioId, hash],
    );
    await manager.query(
      `INSERT INTO membresias_institucion
         (id, id_usuario, id_institucion_educativa, id_persona, estado, fecha_inicio, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'ACTIVA', CURRENT_DATE, now(), now())`,
      [membresiaId, usuarioId, ctx.institucionId, idPersonaDocente],
    );
    const [rol] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'DOCENTE' LIMIT 1`,
    );
    if (rol) {
      await manager.query(
        `INSERT INTO asignaciones_rol_usuario
           (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVA', CURRENT_DATE, now())`,
        [randomUUID(), usuarioId, rol.id, membresiaId, ctx.sedeId],
      );
    }
  });

  return { correo, clave, usuarioId };
}

async function limpiarContexto(
  ds: DataSource,
  ctx: ContextoTest,
): Promise<void> {
  const tableExists = async (t: string) => {
    const res = await ds.query<{ count: string }[]>(
      `SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
      [t],
    );
    return Number(res[0].count) > 0;
  };

  const cleanTable = async (t: string) => {
    if (await tableExists(t)) {
      await ds.query(`DELETE FROM ${t} WHERE id_institucion_educativa = $1`, [
        ctx.institucionId,
      ]);
    }
  };

  await cleanTable('docentes_especialidades_profesionales');
  await cleanTable('especialidades_profesionales');
  await cleanTable('asignaciones_docente_sede');
  await cleanTable('docentes');
  await ds.query(`DELETE FROM personas WHERE id_institucion_educativa = $1`, [
    ctx.institucionId,
  ]);

  // Clean all user roles/membresias/sessions/credentials for users that belong to this IE
  const usuarios = await ds.query<{ id_usuario: string }[]>(
    `SELECT id_usuario FROM membresias_institucion WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
  const uIds = usuarios.map((u) => u.id_usuario);

  if (uIds.length > 0) {
    await ds.query(
      `DELETE FROM asignaciones_rol_usuario WHERE id_usuario = ANY($1)`,
      [uIds],
    );
    await ds.query(
      `DELETE FROM membresias_institucion WHERE id_usuario = ANY($1)`,
      [uIds],
    );
    await ds.query(
      `DELETE FROM credenciales_usuario WHERE id_usuario = ANY($1)`,
      [uIds],
    );
    await ds.query(`DELETE FROM sesiones_usuario WHERE id_usuario = ANY($1)`, [
      uIds,
    ]);
    await ds.query(`DELETE FROM usuarios WHERE id = ANY($1)`, [uIds]);
  }

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
  sedeId: string | null = null,
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

  const contexto = listaContextos.find((item) => {
    if (sedeId) {
      return item.ambito === 'SEDE' && item.sedeId === sedeId;
    }
    return (
      item.ambito === 'INSTITUCION' && item.institucionId === institucionId
    );
  });
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

describeE2E('Flujo docentes E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let ds: DataSource;
  let ctx: ContextoTest;
  let ctxB: ContextoTest;

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    configurarAplicacion(app, { swaggerHabilitado: false } as any);
    await app.init();
    ds = modulo.get(DataSource);

    ctx = await crearContextoCompleto(ds, 'EDOC1');
    ctxB = await crearContextoCompleto(ds, 'EDOC2');
  });

  afterAll(async () => {
    if (ds) {
      await limpiarContexto(ds, ctx).catch(() => undefined);
      await limpiarContexto(ds, ctxB).catch(() => undefined);
    }
    if (app) await app.close();
  });

  it('GET /api/v1/docentes sin token retorna 401', () => {
    return request(app.getHttpServer()).get('/api/v1/docentes').expect(401);
  });

  it('GET /api/v1/docentes retorna listado vacio inicialmente', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    const res = await request(app.getHttpServer())
      .get('/api/v1/docentes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const body = res.body as { datos: unknown[]; total: number };
    expect(Array.isArray(body.datos)).toBe(true);
    expect(body.total).toBe(0);
  });

  it('POST /api/v1/docentes crea un docente correctamente y le asigna la sede principal', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    const res = await request(app.getHttpServer())
      .post('/api/v1/docentes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idPersona: ctx.personaId,
        idSede: ctx.sedeId,
        codigo: 'DOC-001',
        fechaIngreso: '2025-03-01',
        perfilProfesional: 'Licenciado en Educacion Secundaria',
        observacion: 'Creado en test E2E',
      })
      .expect(201);
    const body = res.body as { id: string };
    expect(typeof body.id).toBe('string');
  });

  it('POST /api/v1/docentes con codigo duplicado retorna 409', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    await request(app.getHttpServer())
      .post('/api/v1/docentes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idPersona: ctx.personaBId,
        idSede: ctx.sedeId,
        codigo: 'DOC-001',
      })
      .expect(409);
  });

  it('POST /api/v1/docentes con sede de otra institucion retorna 422', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    await request(app.getHttpServer())
      .post('/api/v1/docentes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idPersona: ctx.personaBId,
        idSede: ctxB.sedeId,
        codigo: 'DOC-999',
      })
      .expect(422);
  });

  it('GET /api/v1/docentes/:id retorna el docente con su ficha completa', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/docentes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const docenteId = (listRes.body as { datos: { id: string }[] }).datos[0].id;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/docentes/${docenteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = res.body as {
      docente: { id: string; codigo: string };
      sedes: { idSede: string; esPrincipal: boolean }[];
    };
    expect(body.docente.id).toBe(docenteId);
    expect(body.docente.codigo).toBe('DOC-001');
    expect(body.sedes[0].idSede).toBe(ctx.sedeId);
    expect(body.sedes[0].esPrincipal).toBe(true);
  });

  it('GET /api/v1/docentes/mi-perfil retorna el perfil propio del docente', async () => {
    // 1. Obtener ID del docente creado
    const tokenAdmin = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/docentes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    const docenteId = (listRes.body as { datos: { id: string }[] }).datos[0].id;

    // 2. Crear usuario con rol DOCENTE para esa persona
    const uCtx = await crearContextoDocente(ds, ctx, ctx.personaId, 'DOC1');

    // 3. Iniciar sesión como docente y obtener su perfil
    const tokenDoc = await obtenerTokenAcceso(
      app,
      uCtx.correo,
      uCtx.clave,
      ctx.institucionId,
      ctx.sedeId,
    );

    const res = await request(app.getHttpServer())
      .get('/api/v1/docentes/mi-perfil')
      .set('Authorization', `Bearer ${tokenDoc}`)
      .expect(200);

    const body = res.body as {
      docente: { id: string };
      persona: { nombres: string };
    };
    expect(body.docente.id).toBe(docenteId);
    expect(body.persona.nombres).toBe('Docente');
  });

  it('POST /api/v1/docentes/:id/sedes asigna otra sede', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/docentes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const docenteId = (listRes.body as { datos: { id: string }[] }).datos[0].id;

    const res = await request(app.getHttpServer())
      .post(`/api/v1/docentes/${docenteId}/sedes`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        idSede: ctx.sedeBId,
        esPrincipal: false,
        fechaInicio: '2025-04-01',
        observacion: 'Segunda sede',
      })
      .expect(201);
    const body = res.body as { id: string };
    expect(body.id).toBeDefined();
  });

  it('POST /api/v1/docentes/:id/sedes/:idAsignacion/establecer-principal cambia la principal transaccionalmente', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/docentes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const docenteId = (listRes.body as { datos: { id: string }[] }).datos[0].id;

    // Obtener ficha para ver las asignaciones
    const fichaRes = await request(app.getHttpServer())
      .get(`/api/v1/docentes/${docenteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    interface FichaResponse {
      sedes: {
        id: string;
        idSede: string;
        esPrincipal: boolean;
        estado: string;
      }[];
      docente: { id: string; codigo: string; estado: string };
    }
    const fichaBody = fichaRes.body as FichaResponse;
    const asigB = fichaBody.sedes.find((s) => s.idSede === ctx.sedeBId);
    expect(asigB).toBeDefined();

    // Establecer la sede B como principal
    await request(app.getHttpServer())
      .post(
        `/api/v1/docentes/${docenteId}/sedes/${asigB!.id}/establecer-principal`,
      )
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    // Verificar en la ficha que ahora B es principal y P no
    const ficha2Res = await request(app.getHttpServer())
      .get(`/api/v1/docentes/${docenteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const ficha2Body = ficha2Res.body as FichaResponse;
    const sedesActualizadas = ficha2Body.sedes;
    const sP = sedesActualizadas.find((s) => s.idSede === ctx.sedeId);
    const sB = sedesActualizadas.find((s) => s.idSede === ctx.sedeBId);

    expect(sB?.esPrincipal).toBe(true);
    expect(sP?.esPrincipal).toBe(false);
  });

  it('PATCH /api/v1/docentes/:id/estado transiciona los estados correctamente (CESADO inactiva sedes)', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/docentes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const docenteId = (listRes.body as { datos: { id: string }[] }).datos[0].id;

    // Cambiar estado a CESADO
    await request(app.getHttpServer())
      .patch(`/api/v1/docentes/${docenteId}/estado`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        estado: 'CESADO',
        fechaCese: '2025-06-01',
      })
      .expect(200);

    // Verificar que el docente está CESADO y sus asignaciones están INACTIVAS
    const fichaRes = await request(app.getHttpServer())
      .get(`/api/v1/docentes/${docenteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    interface FichaResponse {
      sedes: {
        id: string;
        idSede: string;
        esPrincipal: boolean;
        estado: string;
      }[];
      docente: { id: string; codigo: string; estado: string };
    }
    const fichaResBody = fichaRes.body as FichaResponse;
    expect(fichaResBody.docente.estado).toBe('CESADO');
    expect(fichaResBody.sedes.every((s) => s.estado === 'INACTIVA')).toBe(true);
  });
});
