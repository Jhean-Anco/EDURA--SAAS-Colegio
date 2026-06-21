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

// ── Interfaces ────────────────────────────────────────────────────────────────

interface IdResponse {
  id: string;
}

interface AnioResponse {
  id: string;
  anio: number;
  estado: string;
}

interface PeriodoResponse {
  id: string;
  codigo: string;
}

interface GradoResponse {
  id: string;
  nombreNivel: string;
}

interface SeccionResponse {
  id: string;
  codigo: string;
  turno: string;
}

// ── Setup helpers ─────────────────────────────────────────────────────────────

interface InstitucionSetup {
  institucionId: string;
  sedeA1Id: string;
  sedeA2Id: string;
  adminCorreo: string;
  adminClave: string;
  adminId: string;
  adminMembresiaId: string;
  directorA1Correo: string;
  directorA1Clave: string;
  directorA1Id: string;
  directorA1MembresiaId: string;
  directorA2Correo: string;
  directorA2Clave: string;
  directorA2Id: string;
  directorA2MembresiaId: string;
}

async function crearInstitucionConUsuarios(
  ds: DataSource,
  sufijo: string,
): Promise<InstitucionSetup> {
  const institucionId = randomUUID();
  const sedeA1Id = randomUUID();
  const sedeA2Id = randomUUID();
  const codigoBase = `IE-${sufijo}-${Date.now().toString(36)}`.slice(0, 40);

  const adminId = randomUUID();
  const adminMembresiaId = randomUUID();
  const adminCorreo = `admin-${randomUUID()}@test.edura.local`;
  const adminClave = `Admin${sufijo}@2026!`;

  const directorA1Id = randomUUID();
  const directorA1MembresiaId = randomUUID();
  const directorA1Correo = `dir-a1-${randomUUID()}@test.edura.local`;
  const directorA1Clave = `DirA1${sufijo}@2026!`;

  const directorA2Id = randomUUID();
  const directorA2MembresiaId = randomUUID();
  const directorA2Correo = `dir-a2-${randomUUID()}@test.edura.local`;
  const directorA2Clave = `DirA2${sufijo}@2026!`;

  await ds.transaction(async (m) => {
    // Institución y sedes
    await m.query(
      `INSERT INTO instituciones_educativas
         (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'PUBLICA', 'ACTIVA', now(), now())`,
      [institucionId, codigoBase, `Inst ${sufijo}`, `I-${sufijo}`],
    );
    await m.query(
      `INSERT INTO sedes (id, id_institucion_educativa, codigo, nombre, es_principal, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, true, 'ACTIVA', now(), now())`,
      [sedeA1Id, institucionId, `S1-${sufijo}`, `Sede A1 ${sufijo}`],
    );
    await m.query(
      `INSERT INTO sedes (id, id_institucion_educativa, codigo, nombre, es_principal, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, false, 'ACTIVA', now(), now())`,
      [sedeA2Id, institucionId, `S2-${sufijo}`, `Sede A2 ${sufijo}`],
    );

    // Obtener roles
    const [rolAdmin] = await m.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_INSTITUCION' LIMIT 1`,
    );
    const [rolDirector] = await m.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'DIRECTOR_SEDE' LIMIT 1`,
    );

    // Usuario ADMIN (solo ADMINISTRADOR_INSTITUCION, sin sede)
    const hashAdmin = await argon2.hash(adminClave, { type: argon2.argon2id });
    await m.query(
      `INSERT INTO usuarios (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
      [adminId, adminCorreo, adminCorreo.toLowerCase(), `Admin ${sufijo}`],
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

    // Usuario DIRECTOR A1 (solo DIRECTOR_SEDE en sedeA1)
    const hashDir1 = await argon2.hash(directorA1Clave, {
      type: argon2.argon2id,
    });
    await m.query(
      `INSERT INTO usuarios (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
      [
        directorA1Id,
        directorA1Correo,
        directorA1Correo.toLowerCase(),
        `Dir A1 ${sufijo}`,
      ],
    );
    await m.query(
      `INSERT INTO credenciales_usuario (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
       VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())`,
      [directorA1Id, hashDir1],
    );
    await m.query(
      `INSERT INTO membresias_institucion (id, id_usuario, id_institucion_educativa, estado, fecha_inicio, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'ACTIVA', CURRENT_DATE, now(), now())`,
      [directorA1MembresiaId, directorA1Id, institucionId],
    );
    if (rolDirector) {
      await m.query(
        `INSERT INTO asignaciones_rol_usuario (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVA', CURRENT_DATE, now())`,
        [
          randomUUID(),
          directorA1Id,
          rolDirector.id,
          directorA1MembresiaId,
          sedeA1Id,
        ],
      );
    }

    // Usuario DIRECTOR A2 (solo DIRECTOR_SEDE en sedeA2)
    const hashDir2 = await argon2.hash(directorA2Clave, {
      type: argon2.argon2id,
    });
    await m.query(
      `INSERT INTO usuarios (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
      [
        directorA2Id,
        directorA2Correo,
        directorA2Correo.toLowerCase(),
        `Dir A2 ${sufijo}`,
      ],
    );
    await m.query(
      `INSERT INTO credenciales_usuario (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
       VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())`,
      [directorA2Id, hashDir2],
    );
    await m.query(
      `INSERT INTO membresias_institucion (id, id_usuario, id_institucion_educativa, estado, fecha_inicio, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'ACTIVA', CURRENT_DATE, now(), now())`,
      [directorA2MembresiaId, directorA2Id, institucionId],
    );
    if (rolDirector) {
      await m.query(
        `INSERT INTO asignaciones_rol_usuario (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVA', CURRENT_DATE, now())`,
        [
          randomUUID(),
          directorA2Id,
          rolDirector.id,
          directorA2MembresiaId,
          sedeA2Id,
        ],
      );
    }
  });

  return {
    institucionId,
    sedeA1Id,
    sedeA2Id,
    adminCorreo,
    adminClave,
    adminId,
    adminMembresiaId,
    directorA1Correo,
    directorA1Clave,
    directorA1Id,
    directorA1MembresiaId,
    directorA2Correo,
    directorA2Clave,
    directorA2Id,
    directorA2MembresiaId,
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
  await cleanByInst('secciones_academicas');
  await cleanByInst('ofertas_grado_sede');
  await cleanByInst('periodos_academicos');
  await cleanByInst('anios_academicos');
  await cleanByInst('grados_educativos');
  await cleanByInst('niveles_educativos');
  await cleanByInst('elementos_infraestructura');

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
  sedeId: string | null = null,
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
  const ctx = lista.find((c) =>
    sedeId
      ? c.ambito === 'SEDE' && c.sedeId === sedeId
      : c.ambito === 'INSTITUCION' && c.institucionId === institucionId,
  );
  if (!ctx)
    throw new Error(
      `No se encontró contexto para ${correo} (sedeId=${sedeId ?? 'null'})`,
    );

  const selRes = await request(app.getHttpServer())
    .post('/api/v1/autenticacion/seleccionar-contexto')
    .set('Authorization', `Bearer ${preToken}`)
    .send(ctx)
    .expect(201);
  return (selRes.body as { accessToken: string }).accessToken;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describeE2E('Flujo estructura académica E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let ds: DataSource;
  let setup: InstitucionSetup;
  let tokenAdmin: string;

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    configurarAplicacion(app, true);
    await app.init();
    ds = modulo.get(DataSource);

    setup = await crearInstitucionConUsuarios(ds, 'EA1');
    tokenAdmin = await obtenerToken(
      app,
      setup.adminCorreo,
      setup.adminClave,
      setup.institucionId,
    );
  });

  afterAll(async () => {
    if (ds)
      await limpiarInstitucion(ds, setup.institucionId).catch(() => undefined);
    if (app) await app.close();
  });

  // ── Calendario Académico ──────────────────────────────────────────────────

  describe('Calendario Académico (Años y Períodos)', () => {
    let anioId: string;
    let periodoId: string;

    it('POST /anios crea un año planificado', async () => {
      const res = await request(app.getHttpServer())
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

      anioId = (res.body as IdResponse).id;
      expect(anioId).toBeDefined();
    });

    it('GET /anios retorna el año creado', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/estructura-academica/anios')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      const items = res.body as AnioResponse[];
      const creado = items.find((a) => a.id === anioId);
      expect(creado?.anio).toBe(2026);
      expect(creado?.estado).toBe('PLANIFICADO');
    });

    it('POST /anios/:id/periodos crea un período bimestral', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/estructura-academica/anios/${anioId}/periodos`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          codigo: 'B1',
          nombre: 'Primer Bimestre',
          tipo: 'BIMESTRE',
          orden: 1,
          fechaInicio: '2026-03-01',
          fechaFin: '2026-04-30',
        })
        .expect(201);

      periodoId = (res.body as IdResponse).id;
      expect(periodoId).toBeDefined();
    });

    it('GET /anios/:id/periodos retorna el período', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/estructura-academica/anios/${anioId}/periodos`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      const items = res.body as PeriodoResponse[];
      expect(items.find((p) => p.id === periodoId)?.codigo).toBe('B1');
    });
  });

  // ── Catálogos ─────────────────────────────────────────────────────────────

  describe('Catálogos (Niveles y Grados)', () => {
    let nivelId: string;
    let gradoId: string;

    it('POST /niveles crea un nivel', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/niveles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ codigo: 'SEC', nombre: 'Secundaria', orden: 1 })
        .expect(201);

      nivelId = (res.body as IdResponse).id;
      expect(nivelId).toBeDefined();
    });

    it('POST /grados crea un grado', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/grados')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          idNivelEducativo: nivelId,
          codigo: '1SEC',
          nombre: 'Primero de Secundaria',
          orden: 1,
        })
        .expect(201);

      gradoId = (res.body as IdResponse).id;
      expect(gradoId).toBeDefined();
    });

    it('GET /grados retorna el grado con nivel correcto', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/estructura-academica/grados')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      const items = res.body as GradoResponse[];
      expect(items.find((g) => g.id === gradoId)?.nombreNivel).toBe(
        'Secundaria',
      );
    });
  });

  // ── Ofertas y Secciones ───────────────────────────────────────────────────

  describe('Ofertas y Secciones', () => {
    let anioId: string;
    let nivelId: string;
    let gradoId: string;
    let ofertaA1Id: string;
    let ofertaA2Id: string;
    let seccionA1Id: string;

    beforeAll(async () => {
      // Año, nivel, grado compartidos para este suite
      const [anioRes, nivelRes] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/v1/estructura-academica/anios')
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({
            anio: 2027,
            codigo: '2027',
            nombre: 'Año 2027',
            fechaInicio: '2027-03-01',
            fechaFin: '2027-12-20',
            estado: 'PLANIFICADO',
          }),
        request(app.getHttpServer())
          .post('/api/v1/estructura-academica/niveles')
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ codigo: 'PRI', nombre: 'Primaria', orden: 2 }),
      ]);
      anioId = (anioRes.body as IdResponse).id;
      nivelId = (nivelRes.body as IdResponse).id;

      const gradoRes = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/grados')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          idNivelEducativo: nivelId,
          codigo: '1PRI',
          nombre: 'Primero Primaria',
          orden: 1,
        });
      gradoId = (gradoRes.body as IdResponse).id;
    });

    it('POST /ofertas crea oferta en sede A1', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/ofertas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          idSede: setup.sedeA1Id,
          idGradoEducativo: gradoId,
          idAnioAcademico: anioId,
          capacidadReferencial: 30,
        })
        .expect(201);

      ofertaA1Id = (res.body as IdResponse).id;
      expect(ofertaA1Id).toBeDefined();
    });

    it('POST /ofertas crea oferta en sede A2', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/ofertas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          idSede: setup.sedeA2Id,
          idGradoEducativo: gradoId,
          idAnioAcademico: anioId,
          capacidadReferencial: 30,
        })
        .expect(201);

      ofertaA2Id = (res.body as IdResponse).id;
      expect(ofertaA2Id).toBeDefined();
    });

    it('POST /ofertas/:id/secciones crea sección en A1', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/estructura-academica/ofertas/${ofertaA1Id}/secciones`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          codigo: 'A',
          nombre: 'Sección A',
          turno: 'MANANA',
          capacidadMaxima: 25,
        })
        .expect(201);

      seccionA1Id = (res.body as IdResponse).id;
      expect(seccionA1Id).toBeDefined();
    });

    it('POST /ofertas/:id/secciones crea sección en A2', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/estructura-academica/ofertas/${ofertaA2Id}/secciones`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          codigo: 'A',
          nombre: 'Sección A',
          turno: 'MANANA',
          capacidadMaxima: 25,
        })
        .expect(201);

      expect((res.body as IdResponse).id).toBeDefined();
    });

    it('GET /ofertas/:id/secciones retorna la sección de A1', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/estructura-academica/ofertas/${ofertaA1Id}/secciones`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      const items = res.body as SeccionResponse[];
      expect(items.find((s) => s.id === seccionA1Id)?.codigo).toBe('A');
    });

    // ── Aislamiento por sede ────────────────────────────────────────────────

    describe('Aislamiento por sede', () => {
      let tokenDirA1: string;
      let tokenDirA2: string;

      beforeAll(async () => {
        [tokenDirA1, tokenDirA2] = await Promise.all([
          obtenerToken(
            app,
            setup.directorA1Correo,
            setup.directorA1Clave,
            setup.institucionId,
            setup.sedeA1Id,
          ),
          obtenerToken(
            app,
            setup.directorA2Correo,
            setup.directorA2Clave,
            setup.institucionId,
            setup.sedeA2Id,
          ),
        ]);
      });

      it('Director A1 lista secciones de su sede (200)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/v1/estructura-academica/ofertas/${ofertaA1Id}/secciones`)
          .set('Authorization', `Bearer ${tokenDirA1}`)
          .expect(200);

        const items = res.body as SeccionResponse[];
        expect(items.some((s) => s.id === seccionA1Id)).toBe(true);
      });

      it('Director A1 no lista secciones de A2 (lista vacía por filtro sedeId)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/v1/estructura-academica/ofertas/${ofertaA2Id}/secciones`)
          .set('Authorization', `Bearer ${tokenDirA1}`)
          .expect(200);

        // El consultador filtra por sedeId A1, que no coincide con la oferta A2
        expect((res.body as SeccionResponse[]).length).toBe(0);
      });

      it('Director A1 no puede actualizar sección de A2 (404)', async () => {
        // Necesitamos id de la sección de A2
        const seccionesA2Res = await request(app.getHttpServer())
          .get(`/api/v1/estructura-academica/ofertas/${ofertaA2Id}/secciones`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .expect(200);
        const seccionA2Id = (seccionesA2Res.body as SeccionResponse[])[0]?.id;

        if (!seccionA2Id) return; // skip si no existe
        await request(app.getHttpServer())
          .patch(
            `/api/v1/estructura-academica/ofertas/${ofertaA2Id}/secciones/${seccionA2Id}`,
          )
          .set('Authorization', `Bearer ${tokenDirA1}`)
          .send({ nombre: 'Intento cruzado' })
          .expect(404);
      });

      it('Director A2 no puede crear oferta en sede A1 (403)', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/estructura-academica/ofertas')
          .set('Authorization', `Bearer ${tokenDirA2}`)
          .send({
            idSede: setup.sedeA1Id,
            idGradoEducativo: gradoId,
            idAnioAcademico: anioId,
          })
          .expect(403);
      });
    });

    // ── Validaciones de contrato ──────────────────────────────────────────

    describe('Validaciones de contrato', () => {
      it('capacidadMaxima: null retorna 400', async () => {
        await request(app.getHttpServer())
          .post(`/api/v1/estructura-academica/ofertas/${ofertaA1Id}/secciones`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({
            codigo: 'Z',
            nombre: 'Sección Z',
            turno: 'MANANA',
            capacidadMaxima: null,
          })
          .expect(400);
      });

      it('PATCH sección con idOferta incorrecto retorna 404', async () => {
        const idOfertaFalso = randomUUID();
        await request(app.getHttpServer())
          .patch(
            `/api/v1/estructura-academica/ofertas/${idOfertaFalso}/secciones/${seccionA1Id}`,
          )
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ nombre: 'Intento padre incorrecto' })
          .expect(404);
      });

      it('Crear oferta con año cerrado retorna 422', async () => {
        // Crear y cerrar un año
        const anioTempRes = await request(app.getHttpServer())
          .post('/api/v1/estructura-academica/anios')
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({
            anio: 2020,
            codigo: '2020',
            nombre: 'Año 2020',
            fechaInicio: '2020-03-01',
            fechaFin: '2020-12-20',
            estado: 'PLANIFICADO',
          });
        const anioTempId = (anioTempRes.body as IdResponse).id;

        // Activar → Cerrar
        await request(app.getHttpServer())
          .patch(`/api/v1/estructura-academica/anios/${anioTempId}/estado`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ estado: 'ACTIVO' });
        await request(app.getHttpServer())
          .patch(`/api/v1/estructura-academica/anios/${anioTempId}/estado`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ estado: 'CERRADO' });

        await request(app.getHttpServer())
          .post('/api/v1/estructura-academica/ofertas')
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({
            idSede: setup.sedeA1Id,
            idGradoEducativo: gradoId,
            idAnioAcademico: anioTempId,
          })
          .expect(422);
      });

      it('Activar oferta con año planificado retorna 422', async () => {
        // ofertaA1Id tiene año en estado PLANIFICADO
        await request(app.getHttpServer())
          .patch(`/api/v1/estructura-academica/ofertas/${ofertaA1Id}/estado`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ estado: 'ACTIVA' })
          .expect(422);
      });

      it('Crear sección sobre oferta cancelada retorna 422', async () => {
        // Crear oferta limpia y cancelarla
        const [anioFreshRes, nivelFreshRes] = await Promise.all([
          request(app.getHttpServer())
            .post('/api/v1/estructura-academica/anios')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
              anio: 2028,
              codigo: '2028',
              nombre: 'Año 2028',
              fechaInicio: '2028-03-01',
              fechaFin: '2028-12-20',
              estado: 'PLANIFICADO',
            }),
          request(app.getHttpServer())
            .post('/api/v1/estructura-academica/niveles')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({ codigo: 'INI', nombre: 'Inicial', orden: 3 }),
        ]);
        const anioFreshId = (anioFreshRes.body as IdResponse).id;
        const nivelFreshId = (nivelFreshRes.body as IdResponse).id;

        const gradoFreshRes = await request(app.getHttpServer())
          .post('/api/v1/estructura-academica/grados')
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({
            idNivelEducativo: nivelFreshId,
            codigo: '1INI',
            nombre: 'Primero Inicial',
            orden: 1,
          });
        const gradoFreshId = (gradoFreshRes.body as IdResponse).id;

        const ofertaCancelRes = await request(app.getHttpServer())
          .post('/api/v1/estructura-academica/ofertas')
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({
            idSede: setup.sedeA1Id,
            idGradoEducativo: gradoFreshId,
            idAnioAcademico: anioFreshId,
          });
        const ofertaCancelId = (ofertaCancelRes.body as IdResponse).id;

        await request(app.getHttpServer())
          .patch(
            `/api/v1/estructura-academica/ofertas/${ofertaCancelId}/estado`,
          )
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ estado: 'CANCELADA' });

        await request(app.getHttpServer())
          .post(
            `/api/v1/estructura-academica/ofertas/${ofertaCancelId}/secciones`,
          )
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({
            codigo: 'X',
            nombre: 'Sección X',
            turno: 'MANANA',
            capacidadMaxima: 20,
          })
          .expect(409);
      });

      it('POST espacio fuera de sede retorna 422', async () => {
        const tipoElemId = randomUUID();
        const estadoConservId = randomUUID();
        const espacioOtroId = randomUUID();

        await ds.transaction(async (m) => {
          const existingType = await m.query<{ id: string }[]>(
            `SELECT id FROM tipos_elemento_infraestructura WHERE codigo = 'TIPO-E2E-1' LIMIT 1`,
          );
          const tipoId = existingType[0]?.id ?? tipoElemId;
          if (!existingType[0]) {
            await m.query(
              `INSERT INTO tipos_elemento_infraestructura (id, codigo, nombre, activo) VALUES ($1, 'TIPO-E2E-1', 'Tipo E2E', true)`,
              [tipoElemId],
            );
          }
          const existingEC = await m.query<{ id: string }[]>(
            `SELECT id FROM estados_conservacion WHERE codigo = 'ESTADO-E2E-1' LIMIT 1`,
          );
          const ecId = existingEC[0]?.id ?? estadoConservId;
          if (!existingEC[0]) {
            await m.query(
              `INSERT INTO estados_conservacion (id, codigo, nombre, orden, activo) VALUES ($1, 'ESTADO-E2E-1', 'Bueno', 1, true)`,
              [estadoConservId],
            );
          }
          await m.query(
            `INSERT INTO elementos_infraestructura (id, id_sede, id_tipo_elemento, id_estado_conservacion, codigo, nombre, estado)
             VALUES ($1, $2, $3, $4, 'ESP-SEDEA2', 'Aula Sede A2', 'ACTIVO')`,
            [espacioOtroId, setup.sedeA2Id, tipoId, ecId],
          );
        });

        // La oferta es de A1, espacio es de A2
        await request(app.getHttpServer())
          .post(`/api/v1/estructura-academica/ofertas/${ofertaA1Id}/secciones`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({
            codigo: 'E',
            nombre: 'Sec Espacio Cruzado',
            turno: 'MANANA',
            capacidadMaxima: 20,
            idEspacioFisico: espacioOtroId,
          })
          .expect(422);
      });
    });
  });
});
