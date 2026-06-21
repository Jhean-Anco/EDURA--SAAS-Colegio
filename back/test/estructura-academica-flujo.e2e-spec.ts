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
  correo: string;
  clave: string;
}

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

async function crearContextoCompleto(
  ds: DataSource,
  sufijo: string,
): Promise<ContextoTest> {
  const institucionId = randomUUID();
  const sedeId = randomUUID();
  const sedeBId = randomUUID();
  const usuarioId = randomUUID();
  const membresiaId = randomUUID();
  const correo = `ea-e2e-${randomUUID()}@test.edura.local`;
  const clave = `Clave${sufijo}@2026!`;
  const codigo = `IE-EA-${sufijo}-${Date.now().toString(36)}`.slice(0, 40);

  await ds.transaction(async (manager) => {
    await manager.query(
      `INSERT INTO instituciones_educativas
         (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'PUBLICA', 'ACTIVA', now(), now())`,
      [institucionId, codigo, `Institucion EA ${sufijo}`, `EA-${sufijo}`],
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
      [usuarioId, correo, correo.toLowerCase(), `Usuario EA ${sufijo}`],
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

    const [rolDirector] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'DIRECTOR_SEDE' LIMIT 1`,
    );
    if (rolDirector) {
      await manager.query(
        `INSERT INTO asignaciones_rol_usuario
           (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVA', CURRENT_DATE, now())`,
        [randomUUID(), usuarioId, rolDirector.id, membresiaId, sedeId],
      );
      await manager.query(
        `INSERT INTO asignaciones_rol_usuario
           (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVA', CURRENT_DATE, now())`,
        [randomUUID(), usuarioId, rolDirector.id, membresiaId, sedeBId],
      );
    }
  });

  return {
    institucionId,
    sedeId,
    sedeBId,
    usuarioId,
    membresiaId,
    correo,
    clave,
  };
}

async function limpiarContexto(
  ds: DataSource,
  ctx: ContextoTest,
): Promise<void> {
  const cleanTable = async (t: string) => {
    await ds.query(`DELETE FROM ${t} WHERE id_institucion_educativa = $1`, [
      ctx.institucionId,
    ]);
  };

  await cleanTable('secciones_academicas');
  await cleanTable('ofertas_grado_sede');
  await cleanTable('periodos_academicos');
  await cleanTable('anios_academicos');
  await cleanTable('grados_educativos');
  await cleanTable('niveles_educativos');
  await cleanTable('elementos_infraestructura');

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

  const contexto = listaContextos.find((item) => {
    if (sedeId) {
      return item.ambito === 'SEDE' && item.sedeId === sedeId;
    }
    return (
      item.ambito === 'INSTITUCION' && item.institucionId === institucionId
    );
  });
  if (!contexto) {
    const ds = app.get(DataSource);
    const u = await ds.query<{ id: string }[]>(
      'SELECT id FROM usuarios WHERE correo_normalizado = $1',
      [correo.toLowerCase()],
    );
    const resolvedUserId = u[0]?.id;
    console.log('--- E2E CONTEXT NOT FOUND DEBUG ---');
    console.log('correo:', correo);
    console.log('institucionId:', institucionId);
    console.log('sedeId:', sedeId);
    console.log('listaContextos:', JSON.stringify(listaContextos, null, 2));
    const allRoles = await ds.query<unknown[]>('SELECT * FROM roles');
    console.log('allRoles in DB:', JSON.stringify(allRoles, null, 2));
    if (resolvedUserId) {
      const userRoles = await ds.query<unknown[]>(
        'SELECT * FROM asignaciones_rol_usuario WHERE id_usuario = $1',
        [resolvedUserId],
      );
      console.log('userRoles in DB:', JSON.stringify(userRoles, null, 2));
    }
    throw new Error(`No se encontró contexto para ${correo}`);
  }

  const seleccionRes = await request(app.getHttpServer())
    .post('/api/v1/autenticacion/seleccionar-contexto')
    .set('Authorization', `Bearer ${tokenPrecontexto}`)
    .send(contexto)
    .expect(201);
  return (seleccionRes.body as { accessToken: string }).accessToken;
}

describeE2E('Flujo estructura académica E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let ds: DataSource;
  let ctx: ContextoTest;
  let tokenInst: string;

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    configurarAplicacion(app, true);
    await app.init();
    ds = modulo.get(DataSource);

    ctx = await crearContextoCompleto(ds, 'EA1');
    tokenInst = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
  });

  afterAll(async () => {
    if (ds) {
      await limpiarContexto(ds, ctx).catch(() => undefined);
    }
    if (app) await app.close();
  });

  describe('Calendario Académico (Años y Períodos)', () => {
    let anioId: string;
    let periodoId: string;

    it('POST /api/v1/estructura-academica/anios crea un año planificado', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/anios')
        .set('Authorization', `Bearer ${tokenInst}`)
        .send({
          anio: 2026,
          codigo: '2026',
          nombre: 'Año Académico 2026',
          fechaInicio: '2026-03-01',
          fechaFin: '2026-12-20',
          estado: 'PLANIFICADO',
          observacion: 'Prueba E2E',
        })
        .expect(201);

      const body = res.body as IdResponse;
      expect(body.id).toBeDefined();
      anioId = body.id;
    });

    it('GET /api/v1/estructura-academica/anios retorna lista conteniendo el año creado', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/estructura-academica/anios')
        .set('Authorization', `Bearer ${tokenInst}`)
        .expect(200);

      const items = res.body as AnioResponse[];
      const creado = items.find((a) => a.id === anioId);
      expect(creado).toBeDefined();
      expect(creado?.anio).toBe(2026);
      expect(creado?.estado).toBe('PLANIFICADO');
    });

    it('POST /api/v1/estructura-academica/anios/:idAnio/periodos crea un bimestres', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/estructura-academica/anios/${anioId}/periodos`)
        .set('Authorization', `Bearer ${tokenInst}`)
        .send({
          codigo: 'B1',
          nombre: 'Primer Bimestre',
          tipo: 'BIMESTRE',
          orden: 1,
          fechaInicio: '2026-03-01',
          fechaFin: '2026-04-30',
          observacion: 'B1 E2E',
        })
        .expect(201);

      const body = res.body as IdResponse;
      expect(body.id).toBeDefined();
      periodoId = body.id;
    });

    it('GET /api/v1/estructura-academica/anios/:idAnio/periodos retorna el periodo creado', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/estructura-academica/anios/${anioId}/periodos`)
        .set('Authorization', `Bearer ${tokenInst}`)
        .expect(200);

      const items = res.body as PeriodoResponse[];
      const creado = items.find((p) => p.id === periodoId);
      expect(creado).toBeDefined();
      expect(creado?.codigo).toBe('B1');
    });
  });

  describe('Catálogos (Niveles y Grados)', () => {
    let nivelId: string;
    let gradoId: string;

    it('POST /api/v1/estructura-academica/niveles crea un nivel educativo', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/niveles')
        .set('Authorization', `Bearer ${tokenInst}`)
        .send({
          codigo: 'SEC',
          nombre: 'Secundaria',
          descripcion: 'Nivel Secundaria',
          orden: 1,
        })
        .expect(201);

      const body = res.body as IdResponse;
      expect(body.id).toBeDefined();
      nivelId = body.id;
    });

    it('POST /api/v1/estructura-academica/grados crea un grado en ese nivel', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/grados')
        .set('Authorization', `Bearer ${tokenInst}`)
        .send({
          idNivelEducativo: nivelId,
          codigo: '1SEC',
          nombre: 'Primero de Secundaria',
          descripcion: 'Primer grado',
          orden: 1,
        })
        .expect(201);

      const body = res.body as IdResponse;
      expect(body.id).toBeDefined();
      gradoId = body.id;
    });

    it('GET /api/v1/estructura-academica/grados retorna el grado creado', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/estructura-academica/grados')
        .set('Authorization', `Bearer ${tokenInst}`)
        .expect(200);

      const items = res.body as GradoResponse[];
      const creado = items.find((g) => g.id === gradoId);
      expect(creado).toBeDefined();
      expect(creado?.nombreNivel).toBe('Secundaria');
    });
  });

  describe('Ofertas y Secciones', () => {
    let anioId: string;
    let nivelId: string;
    let gradoId: string;
    let ofertaId: string;
    let seccionId: string;

    beforeAll(async () => {
      // Registrar un año y grado listos para ofertar
      const anioRes = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/anios')
        .set('Authorization', `Bearer ${tokenInst}`)
        .send({
          anio: 2027,
          codigo: '2027',
          nombre: 'Año Académico 2027',
          fechaInicio: '2027-03-01',
          fechaFin: '2027-12-20',
          estado: 'PLANIFICADO',
        });
      const anioBody = anioRes.body as IdResponse;
      anioId = anioBody.id;

      const nivelRes = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/niveles')
        .set('Authorization', `Bearer ${tokenInst}`)
        .send({
          codigo: 'PRI',
          nombre: 'Primaria',
          orden: 2,
        });
      const nivelBody = nivelRes.body as IdResponse;
      nivelId = nivelBody.id;

      const gradoRes = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/grados')
        .set('Authorization', `Bearer ${tokenInst}`)
        .send({
          idNivelEducativo: nivelId,
          codigo: '1PRI',
          nombre: 'Primero de Primaria',
          orden: 1,
        });
      const gradoBody = gradoRes.body as IdResponse;
      gradoId = gradoBody.id;
    });

    it('POST /api/v1/estructura-academica/ofertas crea oferta grado-sede', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/ofertas')
        .set('Authorization', `Bearer ${tokenInst}`)
        .send({
          idSede: ctx.sedeId,
          idGradoEducativo: gradoId,
          idAnioAcademico: anioId,
          capacidadReferencial: 30,
        })
        .expect(201);

      const body = res.body as IdResponse;
      expect(body.id).toBeDefined();
      ofertaId = body.id;
    });

    it('POST /api/v1/estructura-academica/ofertas/:idOferta/secciones crea sección sin tutor ni espacio', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/estructura-academica/ofertas/${ofertaId}/secciones`)
        .set('Authorization', `Bearer ${tokenInst}`)
        .send({
          codigo: 'A',
          nombre: 'Sección A',
          turno: 'MANANA',
          capacidadMaxima: 25,
        })
        .expect(201);

      const body = res.body as IdResponse;
      expect(body.id).toBeDefined();
      seccionId = body.id;
    });

    it('GET /api/v1/estructura-academica/ofertas/:idOferta/secciones retorna la sección creada', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/estructura-academica/ofertas/${ofertaId}/secciones`)
        .set('Authorization', `Bearer ${tokenInst}`)
        .expect(200);

      const items = res.body as SeccionResponse[];
      const creado = items.find((s) => s.id === seccionId);
      expect(creado).toBeDefined();
      expect(creado?.codigo).toBe('A');
      expect(creado?.turno).toBe('MANANA');
    });

    it('POST /api/v1/estructura-academica/ofertas/:idOferta/secciones con espacio fuera de sede retorna 422', async () => {
      // 1. Crear un espacio físico en sede B
      const espacioOtroId = randomUUID();
      const tipoElemId = randomUUID();
      const estadoConservId = randomUUID();
      await ds.transaction(async (manager) => {
        const existingType = await manager.query<{ id: string }[]>(
          `SELECT id FROM tipos_elemento_infraestructura WHERE codigo = 'TIPO-E2E-1' LIMIT 1`,
        );
        let actualTipoElemId = tipoElemId;
        if (existingType.length > 0) {
          actualTipoElemId = existingType[0].id;
        } else {
          await manager.query(
            `INSERT INTO tipos_elemento_infraestructura (id, codigo, nombre, activo)
             VALUES ($1, 'TIPO-E2E-1', 'Tipo E2E', true)`,
            [tipoElemId],
          );
        }

        const existingEC = await manager.query<{ id: string }[]>(
          `SELECT id FROM estados_conservacion WHERE codigo = 'ESTADO-E2E-1' LIMIT 1`,
        );
        let actualEstadoConservId = estadoConservId;
        if (existingEC.length > 0) {
          actualEstadoConservId = existingEC[0].id;
        } else {
          await manager.query(
            `INSERT INTO estados_conservacion (id, codigo, nombre, orden, activo)
             VALUES ($1, 'ESTADO-E2E-1', 'Bueno', 1, true)`,
            [estadoConservId],
          );
        }

        await manager.query(
          `INSERT INTO elementos_infraestructura
             (id, id_sede, id_tipo_elemento, id_estado_conservacion, codigo, nombre, estado)
           VALUES ($1, $2, $3, $4, 'ESP-SEDEB', 'Aula Sede B', 'ACTIVO')`,
          [espacioOtroId, ctx.sedeBId, actualTipoElemId, actualEstadoConservId],
        );
      });

      // 2. Intentar crear sección asociando ese espacio (la oferta es en sede A)
      await request(app.getHttpServer())
        .post(`/api/v1/estructura-academica/ofertas/${ofertaId}/secciones`)
        .set('Authorization', `Bearer ${tokenInst}`)
        .send({
          codigo: 'B',
          nombre: 'Sección B',
          turno: 'MANANA',
          idEspacioFisico: espacioOtroId,
        })
        .expect(422);
    });

    it('POST /api/v1/estructura-academica/ofertas con token de sede diferente retorna 403 (no autorizado)', async () => {
      // Intentar crear oferta en sede A usando token de sede B (o viceversa)
      // Usaremos tokenSede que está limitado al contexto de sede Principal
      const tokenSedeB = await obtenerTokenAcceso(
        app,
        ctx.correo,
        ctx.clave,
        ctx.institucionId,
        ctx.sedeBId,
      );

      await request(app.getHttpServer())
        .post('/api/v1/estructura-academica/ofertas')
        .set('Authorization', `Bearer ${tokenSedeB}`)
        .send({
          idSede: ctx.sedeId, // Sede A
          idGradoEducativo: gradoId,
          idAnioAcademico: anioId,
        })
        .expect(403); // Revisa control de alcance de Sede (Forbidden por CONTEXTO_NO_AUTORIZADO)
    });
  });
});
