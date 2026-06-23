/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
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
  anioId: string;
  nivelId: string;
  gradoId: string;
  ofertaId: string;
  secAId: string;
  secBId: string;
  est1Id: string;
  est2Id: string;
  est3Id: string;
}

async function crearContextoMatriculas(
  ds: DataSource,
  sufijo: string,
): Promise<ContextoTest> {
  const institucionId = randomUUID();
  const sedeId = randomUUID();
  const usuarioId = randomUUID();
  const membresiaId = randomUUID();
  const personaId = randomUUID();
  const correo = `mat-e2e-${sufijo}@test.edura.local`;
  const clave = `Clave${sufijo}@2025!`;
  const codigo = `IE-MAT-${sufijo}-${Date.now().toString(36)}`.slice(0, 40);

  const anioId = randomUUID();
  const nivelId = randomUUID();
  const gradoId = randomUUID();
  const ofertaId = randomUUID();
  const secAId = randomUUID();
  const secBId = randomUUID();

  const est1Id = randomUUID();
  const est2Id = randomUUID();
  const est3Id = randomUUID();

  await ds.transaction(async (manager) => {
    // 1. Institucion
    await manager.query(
      `INSERT INTO instituciones_educativas
         (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'PUBLICA', 'ACTIVA', now(), now())`,
      [
        institucionId,
        codigo,
        `Institucion Matriculas ${sufijo}`,
        `MAT-${sufijo}`,
      ],
    );

    // 2. Sede
    await manager.query(
      `INSERT INTO sedes
         (id, id_institucion_educativa, codigo, nombre, es_principal, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, true, 'ACTIVA', now(), now())`,
      [sedeId, institucionId, `SEDE-${sufijo}`, `Sede ${sufijo}`],
    );

    // 3. Seguridad/Usuarios
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

    // 4. Estructura Academica
    await manager.query(
      `INSERT INTO anios_academicos (id, id_institucion_educativa, anio, codigo, codigo_normalizado, nombre, fecha_inicio, fecha_fin, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, 2026, '2026', '2026', 'Anio 2026', '2026-03-01', '2026-12-20', 'PLANIFICADO', now(), now())`,
      [anioId, institucionId],
    );

    await manager.query(
      `INSERT INTO niveles_educativos (id, id_institucion_educativa, codigo, codigo_normalizado, nombre, orden, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, 'PRI', 'PRI', 'Primaria', 1, 'ACTIVO', now(), now())`,
      [nivelId, institucionId],
    );

    await manager.query(
      `INSERT INTO grados_educativos (id, id_institucion_educativa, id_nivel_educativo, codigo, codigo_normalizado, nombre, orden, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, '1G', '1G', 'Primer Grado', 1, 'ACTIVO', now(), now())`,
      [gradoId, institucionId, nivelId],
    );

    await manager.query(
      `INSERT INTO ofertas_grado_sede (id, id_institucion_educativa, id_sede, id_grado_educativo, id_anio_academico, capacidad_referencial, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, $5, 30, 'ACTIVA', now(), now())`,
      [ofertaId, institucionId, sedeId, gradoId, anioId],
    );

    // Seccion A (capacity 25)
    await manager.query(
      `INSERT INTO secciones_academicas (id, id_institucion_educativa, id_oferta_grado_sede, codigo, codigo_normalizado, nombre, turno, capacidad_maxima, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'A', 'A', 'Seccion A', 'MANANA', 25, 'ACTIVA', now(), now())`,
      [secAId, institucionId, ofertaId],
    );

    // Seccion B (capacity 1)
    await manager.query(
      `INSERT INTO secciones_academicas (id, id_institucion_educativa, id_oferta_grado_sede, codigo, codigo_normalizado, nombre, turno, capacidad_maxima, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'B', 'B', 'Seccion B', 'MANANA', 1, 'ACTIVA', now(), now())`,
      [secBId, institucionId, ofertaId],
    );

    // 5. Estudiantes
    const estudiantes = [
      { id: est1Id, codigo: 'EST-001', nombre: 'Juan' },
      { id: est2Id, codigo: 'EST-002', nombre: 'Maria' },
      { id: est3Id, codigo: 'EST-003', nombre: 'Pedro' },
    ];

    for (const est of estudiantes) {
      const pId = randomUUID();
      await manager.query(
        `INSERT INTO personas (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_registral, estado, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, 'Estudiante', 'E2E', '2015-06-10', 'NO_ESPECIFICADO', 'ACTIVA', now(), now())`,
        [pId, institucionId, est.nombre],
      );

      await manager.query(
        `INSERT INTO estudiantes (id, id_institucion_educativa, id_sede, id_persona, codigo, estado, fecha_ingreso, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVO', CURRENT_DATE, now(), now())`,
        [est.id, institucionId, sedeId, pId, est.codigo],
      );
    }
  });

  return {
    institucionId,
    sedeId,
    usuarioId,
    membresiaId,
    personaId,
    correo,
    clave,
    anioId,
    nivelId,
    gradoId,
    ofertaId,
    secAId,
    secBId,
    est1Id,
    est2Id,
    est3Id,
  };
}

async function limpiarContextoMatriculas(
  ds: DataSource,
  ctx: ContextoTest,
): Promise<void> {
  await ds.query(
    `DELETE FROM historial_cambios_seccion_matricula WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
  await ds.query(
    `DELETE FROM historial_estados_matricula WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
  await ds.query(`DELETE FROM matriculas WHERE id_institucion_educativa = $1`, [
    ctx.institucionId,
  ]);
  await ds.query(
    `DELETE FROM estudiantes WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
  await ds.query(`DELETE FROM personas WHERE id_institucion_educativa = $1`, [
    ctx.institucionId,
  ]);
  await ds.query(
    `DELETE FROM secciones_academicas WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
  await ds.query(
    `DELETE FROM ofertas_grado_sede WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
  await ds.query(
    `DELETE FROM grados_educativos WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
  await ds.query(
    `DELETE FROM niveles_educativos WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
  await ds.query(
    `DELETE FROM anios_academicos WHERE id_institucion_educativa = $1`,
    [ctx.institucionId],
  );
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

describeE2E('Flujo matriculas E2E (requiere BD)', () => {
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

    ctx = await crearContextoMatriculas(ds, 'E2EM1');
    ctxB = await crearContextoMatriculas(ds, 'E2EM2');
  });

  afterAll(async () => {
    if (ds) {
      await limpiarContextoMatriculas(ds, ctx).catch(() => undefined);
      await limpiarContextoMatriculas(ds, ctxB).catch(() => undefined);
    }
    if (app) await app.close();
  });

  it('GET /api/v1/matriculas sin token retorna 401', () => {
    return request(app.getHttpServer()).get('/api/v1/matriculas').expect(401);
  });

  it('debe registrar una matrícula en borrador, editarla, y activarla en flujo completo', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );

    // 1. Crear borrador
    const crearRes = await request(app.getHttpServer())
      .post('/api/v1/matriculas')
      .set('Authorization', `Bearer ${token}`)
      .set('x-correlation-id', 'corr-1')
      .send({
        idSede: ctx.sedeId,
        idEstudiante: ctx.est1Id,
        idAnioAcademico: ctx.anioId,
        idNivelEducativo: ctx.nivelId,
        idGradoEducativo: ctx.gradoId,
        idOfertaGradoSede: ctx.ofertaId,
        codigoMatricula: 'MAT-E2E-001',
        fechaMatricula: '2026-03-05',
        observacion: 'Borrador inicial',
      })
      .expect(201);

    const matriculaId = (crearRes.body as { id: string }).id;
    expect(typeof matriculaId).toBe('string');

    // 2. Consultar y verificar que esta en BORRADOR
    const getRes1 = await request(app.getHttpServer())
      .get(`/api/v1/matriculas/${matriculaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(getRes1.body.estado).toBe('BORRADOR');

    // 3. Editar borrador (observacion y fecha)
    await request(app.getHttpServer())
      .patch(`/api/v1/matriculas/${matriculaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        observacion: 'Borrador editado',
        fechaMatricula: '2026-03-06',
      })
      .expect(200);

    const getRes2 = await request(app.getHttpServer())
      .get(`/api/v1/matriculas/${matriculaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(getRes2.body.observacion).toBe('Borrador editado');

    // 4. Asignar sección A al borrador antes de activar
    await request(app.getHttpServer())
      .patch(`/api/v1/matriculas/${matriculaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        idSeccionAcademica: ctx.secAId,
      })
      .expect(200);

    // 5. Consultar capacidad disponible para la sección A
    const capRes1 = await request(app.getHttpServer())
      .get(`/api/v1/matriculas/secciones/${ctx.secAId}/capacidad`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    // Borradores no consumen capacidad
    expect(capRes1.body.matriculasActivas).toBe(0);
    expect(capRes1.body.vacantesDisponibles).toBe(25);

    // 6. Activar matrícula
    await request(app.getHttpServer())
      .post(`/api/v1/matriculas/${matriculaId}/activar`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-correlation-id', 'corr-2')
      .expect(201);

    // 7. Verificar estado activo e historial de estados y secciones
    const getRes3 = await request(app.getHttpServer())
      .get(`/api/v1/matriculas/${matriculaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(getRes3.body.estado).toBe('ACTIVA');

    // Capacidad debe actualizarse
    const capRes2 = await request(app.getHttpServer())
      .get(`/api/v1/matriculas/secciones/${ctx.secAId}/capacidad`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(capRes2.body.matriculasActivas).toBe(1);
    expect(capRes2.body.vacantesDisponibles).toBe(24);

    // Historial estados
    const histEstados = await request(app.getHttpServer())
      .get(`/api/v1/matriculas/${matriculaId}/historial-estados`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(histEstados.body.length).toBe(2);
    expect(histEstados.body[0].estadoNuevo).toBe('BORRADOR');
    expect(histEstados.body[1].estadoNuevo).toBe('ACTIVA');
    expect(histEstados.body[1].correlacionId).toBe('corr-2');

    // Historial secciones
    const histSec = await request(app.getHttpServer())
      .get(`/api/v1/matriculas/${matriculaId}/historial-secciones`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(histSec.body.length).toBe(1);
    expect(histSec.body[0].idSeccionNueva).toBe(ctx.secAId);

    // 8. Cambiar a sección B (que tiene capacidad 1)
    await request(app.getHttpServer())
      .post(`/api/v1/matriculas/${matriculaId}/cambiar-seccion`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-correlation-id', 'corr-3')
      .send({
        idSeccionNueva: ctx.secBId,
        motivo: 'Cambio de seccion por rendimiento',
      })
      .expect(201);

    // Capacidad seccion A debe liberarse, y seccion B debe consumirse (llenarse)
    const capResA = await request(app.getHttpServer())
      .get(`/api/v1/matriculas/secciones/${ctx.secAId}/capacidad`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(capResA.body.matriculasActivas).toBe(0);

    const capResB = await request(app.getHttpServer())
      .get(`/api/v1/matriculas/secciones/${ctx.secBId}/capacidad`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(capResB.body.matriculasActivas).toBe(1);
    expect(capResB.body.vacantesDisponibles).toBe(0);

    // Intentar activar otra matrícula (EST-002) en la misma sección B debe fallar por capacidad
    const crearRes2 = await request(app.getHttpServer())
      .post('/api/v1/matriculas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idSede: ctx.sedeId,
        idEstudiante: ctx.est2Id,
        idAnioAcademico: ctx.anioId,
        idNivelEducativo: ctx.nivelId,
        idGradoEducativo: ctx.gradoId,
        idOfertaGradoSede: ctx.ofertaId,
        idSeccionAcademica: ctx.secBId, // full!
        codigoMatricula: 'MAT-E2E-002',
        fechaMatricula: '2026-03-05',
      })
      .expect(201);
    const mat2Id = crearRes2.body.id;

    await request(app.getHttpServer())
      .post(`/api/v1/matriculas/${mat2Id}/activar`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400); // 400 Regla de negocio: capacidad maxima superada

    // 9. Impedir duplicados de matrículas activas para el mismo estudiante en el año
    // Retiramos mat2Id primero (para que no esté en borrador) o creamos borrador para est1
    const crearRes3 = await request(app.getHttpServer())
      .post('/api/v1/matriculas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idSede: ctx.sedeId,
        idEstudiante: ctx.est1Id, // same as matriculaId
        idAnioAcademico: ctx.anioId,
        idNivelEducativo: ctx.nivelId,
        idGradoEducativo: ctx.gradoId,
        idOfertaGradoSede: ctx.ofertaId,
        codigoMatricula: 'MAT-E2E-003',
        fechaMatricula: '2026-03-05',
      })
      .expect(201);
    const mat3Id = crearRes3.body.id;

    await request(app.getHttpServer())
      .post(`/api/v1/matriculas/${mat3Id}/activar`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409); // 409 Conflicto: Duplicado activo

    // 10. Retirar la matrícula activa
    await request(app.getHttpServer())
      .post(`/api/v1/matriculas/${matriculaId}/retirar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ motivo: 'Mudanza' })
      .expect(201);

    const getRes4 = await request(app.getHttpServer())
      .get(`/api/v1/matriculas/${matriculaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(getRes4.body.estado).toBe('RETIRADA');

    // 11. Impedir reactivar
    await request(app.getHttpServer())
      .post(`/api/v1/matriculas/${matriculaId}/activar`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('no debe permitir acceder a matrículas de otra institución (Aislamiento)', async () => {
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

    // Crear matrícula en Institución A
    const crearRes = await request(app.getHttpServer())
      .post('/api/v1/matriculas')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        idSede: ctx.sedeId,
        idEstudiante: ctx.est1Id,
        idAnioAcademico: ctx.anioId,
        idNivelEducativo: ctx.nivelId,
        idGradoEducativo: ctx.gradoId,
        idOfertaGradoSede: ctx.ofertaId,
        codigoMatricula: 'MAT-AISLA-001',
        fechaMatricula: '2026-03-05',
      })
      .expect(201);

    const matId = crearRes.body.id;

    // Intentar verla con el token de Institución B
    await request(app.getHttpServer())
      .get(`/api/v1/matriculas/${matId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('debe validar el formato global de error http', async () => {
    const token = await obtenerTokenAcceso(
      app,
      ctx.correo,
      ctx.clave,
      ctx.institucionId,
    );
    const res = await request(app.getHttpServer())
      .get('/api/v1/matriculas/00000000-0000-0000-0000-000000000000') // not found
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.codigo).toBe('RECURSO_NO_ENCONTRADO');
    expect(res.body.mensaje).toBeDefined();
    expect(res.body.ruta).toBeDefined();
    expect(res.body.fecha).toBeDefined();
  });
});
