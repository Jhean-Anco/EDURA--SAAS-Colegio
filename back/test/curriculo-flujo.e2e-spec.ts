import { INestApplication, ValidationPipe } from '@nestjs/common';
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

interface IdResponse {
  id: string;
}

interface AreaResponse {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
}

interface AsignaturaResponse {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
}

interface PlanResponse {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
  detalles: any[];
}

interface InstitucionSetup {
  institucionId: string;
  sedeId: string;
  adminCorreo: string;
  adminClave: string;
  adminId: string;
  adminMembresiaId: string;
}

async function crearInstitucionConUsuarios(
  ds: DataSource,
  sufijo: string,
): Promise<InstitucionSetup> {
  const institucionId = randomUUID();
  const sedeId = randomUUID();
  const codigoBase = `IE-CURR-${sufijo}-${Date.now().toString(36)}`.slice(0, 40);

  const adminId = randomUUID();
  const adminMembresiaId = randomUUID();
  const adminCorreo = `admin-curr-${randomUUID()}@test.edura.local`;
  const adminClave = `Admin${sufijo}@2026!`;

  await ds.transaction(async (m) => {
    await m.query(
      `INSERT INTO instituciones_educativas
         (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'PUBLICA', 'ACTIVA', now(), now())`,
      [institucionId, codigoBase, `Inst Curr ${sufijo}`, `IC-${sufijo}`],
    );
    await m.query(
      `INSERT INTO sedes (id, id_institucion_educativa, codigo, nombre, es_principal, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, true, 'ACTIVA', now(), now())`,
      [sedeId, institucionId, `S1-${sufijo}`, `Sede A1 ${sufijo}`],
    );

    const [rolAdmin] = await m.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_INSTITUCION' LIMIT 1`,
    );

    const hashAdmin = await argon2.hash(adminClave, { type: argon2.argon2id });
    await m.query(
      `INSERT INTO usuarios (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
      [adminId, adminCorreo, adminCorreo.toLowerCase(), `Admin Curr ${sufijo}`],
    );
    await m.query(
      `INSERT INTO credenciales_usuario (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
       VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())`,
      [adminId, hashAdmin],
    );
    await m.query(
      `INSERT INTO membresias_institucion (id, id_usuario, id_institucion_educativa, estado, fecha_inicio, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'ACTIVA', CURRENT_DATE, now(), now())`,
      [adminMembresiaId, adminId, institucionId],
    );
    if (rolAdmin) {
      await m.query(
        `INSERT INTO asignaciones_rol_usuario (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
         VALUES ($1, $2, $3, $4, NULL, 'ACTIVA', CURRENT_DATE, now())`,
        [randomUUID(), adminId, rolAdmin.id, adminMembresiaId],
      );
    }
  });

  return {
    institucionId,
    sedeId,
    adminCorreo,
    adminClave,
    adminId,
    adminMembresiaId,
  };
}

async function limpiarInstitucion(
  ds: DataSource,
  institucionId: string,
): Promise<void> {
  const cleanByInst = async (t: string) => {
    await ds.query(`DELETE FROM ${t} WHERE id_institucion_educativa = $1`, [
      institucionId,
    ]);
  };
  await cleanByInst('detalles_plan_estudio');
  await cleanByInst('planes_estudio');
  await cleanByInst('asignaturas');
  await cleanByInst('areas_curriculares');
  await cleanByInst('secciones_academicas');
  await cleanByInst('ofertas_grado_sede');
  await cleanByInst('periodos_academicos');
  await cleanByInst('anios_academicos');
  await cleanByInst('grados_educativos');
  await cleanByInst('niveles_educativos');

  const usuarios = await ds.query<{ id_usuario: string }[]>(
    `SELECT id_usuario FROM membresias_institucion WHERE id_institucion_educativa = $1`,
    [institucionId],
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
    institucionId,
  ]);
  await ds.query(`DELETE FROM instituciones_educativas WHERE id = $1`, [
    institucionId,
  ]);
}

async function obtenerToken(
  app: INestApplication<App>,
  correo: string,
  clave: string,
  institucionId: string,
): Promise<string> {
  const loginRes = await request(app.getHttpServer())
    .post('/api/v1/autenticacion/iniciar-sesion')
    .send({ correo, clave })
    .expect(201);
  const preToken = (loginRes.body as { accessToken: string }).accessToken;

  const ctxRes = await request(app.getHttpServer())
    .get('/api/v1/autenticacion/contextos')
    .set('Authorization', `Bearer ${preToken}`)
    .expect(200);

  const lista = ctxRes.body as {
    ambito: string;
    institucionId: string | null;
    sedeId: string | null;
  }[];
  const ctx = lista.find((c) => c.ambito === 'INSTITUCION' && c.institucionId === institucionId);
  if (!ctx)
    throw new Error(`No se encontró contexto para ${correo}`);

  const selRes = await request(app.getHttpServer())
    .post('/api/v1/autenticacion/seleccionar-contexto')
    .set('Authorization', `Bearer ${preToken}`)
    .send(ctx)
    .expect(201);
  return (selRes.body as { accessToken: string }).accessToken;
}

describeE2E('Flujo currículo y planes de estudio E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let ds: DataSource;
  let setup: InstitucionSetup;
  let tokenAdmin: string;

  let anioId: string;
  let nivelId: string;
  let gradoId: string;

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    configurarAplicacion(app, { swaggerHabilitado: false } as any);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    ds = modulo.get(DataSource);

    setup = await crearInstitucionConUsuarios(ds, 'CURR1');
    tokenAdmin = await obtenerToken(
      app,
      setup.adminCorreo,
      setup.adminClave,
      setup.institucionId,
    );

    // Setup base academic structures
    const anioRes = await request(app.getHttpServer())
      .post('/api/v1/estructura-academica/anios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        anio: 2026,
        codigo: '2026',
        nombre: 'Año Académico 2026',
        fechaInicio: '2026-03-01',
        fechaFin: '2026-12-20',
        estado: 'PLANIFICADO',
      })
      .expect(201);
    anioId = (anioRes.body as IdResponse).id;

    // Activate the academic year
    await request(app.getHttpServer())
      .patch(`/api/v1/estructura-academica/anios/${anioId}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado: 'ACTIVO' })
      .expect(200);

    const nivelRes = await request(app.getHttpServer())
      .post('/api/v1/estructura-academica/niveles')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ codigo: 'PRI', nombre: 'Primaria', orden: 1 })
      .expect(201);
    nivelId = (nivelRes.body as IdResponse).id;

    const gradoRes = await request(app.getHttpServer())
      .post('/api/v1/estructura-academica/grados')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        idNivelEducativo: nivelId,
        codigo: '1PRI',
        nombre: 'Primero Primaria',
        orden: 1,
      })
      .expect(201);
    gradoId = (gradoRes.body as IdResponse).id;
  });

  afterAll(async () => {
    if (ds)
      await limpiarInstitucion(ds, setup.institucionId).catch(() => undefined);
    if (app) await app.close();
  });

  describe('Áreas Curriculares y Asignaturas', () => {
    let areaId: string;
    let asignaturaId: string;

    it('POST /curriculo/areas crea un área curricular', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/curriculo/areas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          codigo: 'COMUNICACION',
          nombre: 'Comunicación',
          descripcion: 'Área de letras',
          orden: 1,
        })
        .expect(201);

      areaId = (res.body as IdResponse).id;
      expect(areaId).toBeDefined();
    });

    it('GET /curriculo/areas lista las áreas', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/curriculo/areas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      const items = res.body as AreaResponse[];
      const creada = items.find((a) => a.id === areaId);
      expect(creada?.codigo).toBe('COMUNICACION');
      expect(creada?.estado).toBe('ACTIVA');
    });

    it('POST /curriculo/asignaturas crea una asignatura vinculada', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/curriculo/asignaturas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          idAreaCurricular: areaId,
          codigo: 'LENGUAJE',
          nombre: 'Lenguaje y Gramática',
          nombreCorto: 'Lenguaje',
          descripcion: 'Curso base de comunicación',
          orden: 1,
        })
        .expect(201);

      asignaturaId = (res.body as IdResponse).id;
      expect(asignaturaId).toBeDefined();
    });

    it('GET /curriculo/asignaturas lista las asignaturas', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/curriculo/asignaturas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      const items = res.body as AsignaturaResponse[];
      const creada = items.find((a) => a.id === asignaturaId);
      expect(creada?.codigo).toBe('LENGUAJE');
      expect(creada?.estado).toBe('ACTIVA');
    });
  });

  describe('Planes de Estudio', () => {
    let planId: string;
    let detalleId: string;
    let areaId: string;
    let asignaturaId: string;

    beforeAll(async () => {
      // Create area and subject for plan testing
      const areaRes = await request(app.getHttpServer())
        .post('/api/v1/curriculo/areas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          codigo: 'MATEMATICA',
          nombre: 'Matemática',
          orden: 2,
        })
        .expect(201);
      areaId = (areaRes.body as IdResponse).id;

      const asigRes = await request(app.getHttpServer())
        .post('/api/v1/curriculo/asignaturas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          idAreaCurricular: areaId,
          codigo: 'ARITMETICA',
          nombre: 'Aritmética',
          orden: 1,
        })
        .expect(201);
      asignaturaId = (asigRes.body as IdResponse).id;
    });

    it('POST /curriculo/planes crea un plan de estudio en BORRADOR', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/curriculo/planes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          idAnioAcademico: anioId,
          idGradoEducativo: gradoId,
          codigo: 'PLAN-1PRI-MAT',
          nombre: 'Plan Primero Primaria Matemática',
          observacion: 'Plan inicial',
        })
        .expect(201);

      planId = (res.body as IdResponse).id;
      expect(planId).toBeDefined();
    });

    it('POST /curriculo/planes/:id/detalles agrega asignatura al plan', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/curriculo/planes/${planId}/detalles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          idAsignatura: asignaturaId,
          tipo: 'OBLIGATORIA',
          horasSemanales: 4,
          horasAnuales: 160,
          orden: 1,
          observacion: 'Aritmética básica',
        })
        .expect(201);

      detalleId = (res.body as IdResponse).id;
      expect(detalleId).toBeDefined();
    });

    it('GET /curriculo/planes/:id obtiene plan con detalles correctos', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/curriculo/planes/${planId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      const plan = res.body as PlanResponse;
      expect(plan.id).toBe(planId);
      expect(plan.estado).toBe('BORRADOR');
      expect(plan.detalles.length).toBe(1);
      expect(plan.detalles[0].idAsignatura).toBe(asignaturaId);
      expect(plan.detalles[0].horasSemanales).toBe(4);
    });

    it('Flujo completo de estado BORRADOR -> APROBADO -> VIGENTE', async () => {
      // 1. BORRADOR -> APROBADO via isolated endpoint
      await request(app.getHttpServer())
        .post(`/api/v1/curriculo/planes/${planId}/aprobar`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(201);

      // Verify direct PATCH to APROBADO is rejected with 400 Bad Request
      await request(app.getHttpServer())
        .patch(`/api/v1/curriculo/planes/${planId}/estado`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ estado: 'APROBADO' })
        .expect(400);

      let res = await request(app.getHttpServer())
        .get(`/api/v1/curriculo/planes/${planId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
      expect(res.body.estado).toBe('APROBADO');

      // 2. APROBADO -> VIGENTE
      await request(app.getHttpServer())
        .patch(`/api/v1/curriculo/planes/${planId}/estado`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ estado: 'VIGENTE' })
        .expect(200);

      res = await request(app.getHttpServer())
        .get(`/api/v1/curriculo/planes/${planId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
      expect(res.body.estado).toBe('VIGENTE');
    });

    it('GET /curriculo/planes/resolver resuelve plan vigente correctamente', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/curriculo/planes/resolver?idAnio=${anioId}&idGrado=${gradoId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body.id).toBe(planId);
      expect(res.body.estado).toBe('VIGENTE');
    });
  });
});
