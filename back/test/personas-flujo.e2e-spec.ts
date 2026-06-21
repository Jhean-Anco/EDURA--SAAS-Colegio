import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ConfiguracionAplicacion } from '../src/configuracion/configuracion-aplicacion';
import { configurarAplicacion } from '../src/configuracion/configurar-aplicacion';

const SKIP_E2E = !process.env['BD_HOST'];
const describeE2E = SKIP_E2E ? describe.skip : describe;

describeE2E('Flujo personas E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacion(app, app.get(ConfiguracionAplicacion));
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/v1/salud retorna 200', () => {
    return request(app.getHttpServer()).get('/api/v1/salud').expect(200);
  });

  it('endpoint protegido sin token retorna 401', () => {
    return request(app.getHttpServer()).get('/api/v1/personas').expect(401);
  });

  it('aislamiento multi-institucion: token de institucion A no puede listar personas de institucion B', async () => {
    const institucionA = randomUUID();
    const institucionB = randomUUID();
    const usuarioA = randomUUID();
    const usuarioB = randomUUID();
    const membresiaA = randomUUID();
    const membresiaB = randomUUID();
    const personaA = randomUUID();
    const personaB = randomUUID();
    const correoA = `persona-flujo-a-${personaA}@test.edura.local`;
    const correoB = `persona-flujo-b-${personaB}@test.edura.local`;
    const claveA = 'ClaveA@2024!';
    const claveB = 'ClaveB@2024!';
    const codigoInstitucionA = `FLUJO-A-${Date.now().toString(36)}`;
    const codigoInstitucionB = `FLUJO-B-${Date.now().toString(36)}`;

    await dataSource.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO instituciones_educativas
           (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, 'PUBLICA', 'ACTIVA', now(), now())`,
        [institucionA, codigoInstitucionA, 'Institucion Flujo A', 'F-A'],
      );
      await manager.query(
        `INSERT INTO instituciones_educativas
           (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, 'PUBLICA', 'ACTIVA', now(), now())`,
        [institucionB, codigoInstitucionB, 'Institucion Flujo B', 'F-B'],
      );

      const hashA = await argon2.hash(claveA, { type: argon2.argon2id });
      const hashB = await argon2.hash(claveB, { type: argon2.argon2id });

      await manager.query(
        `INSERT INTO usuarios
           (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
        [usuarioA, correoA, correoA.toLowerCase(), 'Usuario A'],
      );
      await manager.query(
        `INSERT INTO usuarios
           (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
        [usuarioB, correoB, correoB.toLowerCase(), 'Usuario B'],
      );

      await manager.query(
        `INSERT INTO credenciales_usuario
           (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
         VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())`,
        [usuarioA, hashA],
      );
      await manager.query(
        `INSERT INTO credenciales_usuario
           (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
         VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())`,
        [usuarioB, hashB],
      );

      await manager.query(
        `INSERT INTO membresias_institucion
           (id, id_usuario, id_institucion_educativa, estado, fecha_inicio, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, 'ACTIVA', CURRENT_DATE, now(), now())`,
        [membresiaA, usuarioA, institucionA],
      );
      await manager.query(
        `INSERT INTO membresias_institucion
           (id, id_usuario, id_institucion_educativa, estado, fecha_inicio, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, 'ACTIVA', CURRENT_DATE, now(), now())`,
        [membresiaB, usuarioB, institucionB],
      );

      const [rol] = await manager.query<{ id: string }[]>(
        `SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_INSTITUCION' LIMIT 1`,
      );
      if (rol) {
        await manager.query(
          `INSERT INTO asignaciones_rol_usuario
             (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
           VALUES ($1, $2, $3, $4, NULL, 'ACTIVA', CURRENT_DATE, now())`,
          [randomUUID(), usuarioA, rol.id, membresiaA],
        );
        await manager.query(
          `INSERT INTO asignaciones_rol_usuario
             (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
           VALUES ($1, $2, $3, $4, NULL, 'ACTIVA', CURRENT_DATE, now())`,
          [randomUUID(), usuarioB, rol.id, membresiaB],
        );
      }

      await manager.query(
        `INSERT INTO personas
           (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_registral, estado, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, 'Persona', 'A', 'Test', '1990-01-01', 'NO_ESPECIFICADO', 'ACTIVA', now(), now())`,
        [personaA, institucionA],
      );
      await manager.query(
        `INSERT INTO personas
           (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_registral, estado, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, 'Persona', 'B', 'Test', '1990-01-01', 'NO_ESPECIFICADO', 'ACTIVA', now(), now())`,
        [personaB, institucionB],
      );
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/autenticacion/iniciar-sesion')
      .send({ correo: correoA, clave: claveA })
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
      rolCodigo?: string;
      rolId?: string;
    }[];
    const contextoInstitucional = listaContextos.find(
      (contexto) =>
        contexto.ambito === 'INSTITUCION' &&
        contexto.institucionId === institucionA,
    );
    if (!contextoInstitucional) {
      throw new Error(
        `No se encontro contexto institucional para la institucion ${institucionA}`,
      );
    }

    const contextoRes = await request(app.getHttpServer())
      .post('/api/v1/autenticacion/seleccionar-contexto')
      .set('Authorization', `Bearer ${tokenPrecontexto}`)
      .send(contextoInstitucional)
      .expect(200);

    const tokenA = (contextoRes.body as { accessToken: string }).accessToken;

    const res = await request(app.getHttpServer())
      .get('/api/v1/personas')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const ids = (res.body as { datos: { id: string }[] }).datos.map(
      (persona) => persona.id,
    );
    expect(ids).toContain(personaA);
    expect(ids).not.toContain(personaB);
  });

  it('POST /api/v1/personas/consultas/dni con token invalido retorna 401', () => {
    return request(app.getHttpServer())
      .post('/api/v1/personas/consultas/dni')
      .set('Authorization', 'Bearer token-invalido')
      .send({ numeroDni: '12345678' })
      .expect(401);
  });

  it('POST /api/v1/integraciones/documentos/consultas/ruc sin auth retorna 401', () => {
    return request(app.getHttpServer())
      .post('/api/v1/integraciones/documentos/consultas/ruc')
      .send({ ruc: '12345678901' })
      .expect(401);
  });

  it('POST /api/v1/geografia/rutas/calcular sin auth retorna 401', () => {
    return request(app.getHttpServer())
      .post('/api/v1/geografia/rutas/calcular')
      .send({
        origen: { latitud: -12.0, longitud: -77.0 },
        destino: { latitud: -13.0, longitud: -72.0 },
      })
      .expect(401);
  });
});
