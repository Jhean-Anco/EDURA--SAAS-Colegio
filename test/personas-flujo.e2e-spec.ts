import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { configurarAplicacion } from '../src/configuracion/configurar-aplicacion';
import { AppModule } from '../src/app.module';

interface ContextoTenant {
  institucionId: string;
  sedeId: string;
  usuarioId: string;
  membresiaId: string;
  personaId: string;
  rolId: string;
  correo: string;
  clave: string;
}

async function crearTenant(
  ds: DataSource,
  codigo: string,
  sufijo: string,
): Promise<ContextoTenant> {
  const institucionId = randomUUID();
  const sedeId = randomUUID();
  const usuarioId = randomUUID();
  const membresiaId = randomUUID();
  const personaId = randomUUID();
  const rolId = (
    await ds.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_INSTITUCION' LIMIT 1`,
    )
  )[0]?.id;
  if (!rolId) {
    throw new Error('No existe el rol ADMINISTRADOR_INSTITUCION');
  }
  const correo = `usuario-${sufijo.toLowerCase()}-${randomUUID()}@test.edura.local`;
  const correoNormalizado = correo.toLowerCase();
  const clave = `Clave${sufijo}@2026!`;
  const hash = await argon2.hash(clave, { type: argon2.argon2id });

  await ds.transaction(async (manager) => {
    await manager.query(
      `INSERT INTO instituciones_educativas
        (id, codigo, nombre_legal, nombre_corto, tipo_gestion, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'PRIVADA', 'ACTIVA', now(), now())`,
      [institucionId, codigo, `Institucion ${sufijo}`, `INST-${sufijo}`],
    );
    await manager.query(
      `INSERT INTO sedes
        (id, id_institucion_educativa, codigo, nombre, es_principal, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, true, 'ACTIVA', now(), now())`,
      [sedeId, institucionId, `SEDE-${sufijo}`, `Sede ${sufijo}`],
    );
    await manager.query(
      `INSERT INTO usuarios
        (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
      [usuarioId, correo, correoNormalizado, `Usuario ${sufijo}`],
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
    await manager.query(
      `INSERT INTO asignaciones_rol_usuario
        (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, 'ACTIVA', CURRENT_DATE, now())`,
      [randomUUID(), usuarioId, rolId, membresiaId, sedeId],
    );
    await manager.query(
      `INSERT INTO personas
        (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_registral, codigo_pais_nacionalidad, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'Perez', 'Lopez', '1990-01-01', 'NO_ESPECIFICADO', 'PE', 'ACTIVA', now(), now())`,
      [personaId, institucionId, `Persona ${sufijo}`],
    );
  });

  return {
    institucionId,
    sedeId,
    usuarioId,
    membresiaId,
    personaId,
    rolId,
    correo,
    clave,
  };
}

async function limpiarTenant(
  ds: DataSource,
  ctx: ContextoTenant,
): Promise<void> {
  await ds.query(`DELETE FROM personas WHERE id = $1`, [ctx.personaId]);
  await ds.query(`DELETE FROM asignaciones_rol_usuario WHERE id_usuario = $1`, [
    ctx.usuarioId,
  ]);
  await ds.query(`DELETE FROM membresias_institucion WHERE id = $1`, [
    ctx.membresiaId,
  ]);
  await ds.query(`DELETE FROM credenciales_usuario WHERE id_usuario = $1`, [
    ctx.usuarioId,
  ]);
  await ds.query(`DELETE FROM usuarios WHERE id = $1`, [ctx.usuarioId]);
  await ds.query(`DELETE FROM sedes WHERE id = $1`, [ctx.sedeId]);
  await ds.query(`DELETE FROM instituciones_educativas WHERE id = $1`, [
    ctx.institucionId,
  ]);
}

describe('Flujo personas E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let tenantA: ContextoTenant;
  let tenantB: ContextoTenant;

  beforeAll(async () => {
    if (!process.env['BD_HOST']) {
      throw new Error('BD_HOST es obligatorio para ejecutar este E2E');
    }
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacion(app, true);
    await app.init();
    dataSource = moduleFixture.get(DataSource);

    tenantA = await crearTenant(dataSource, `EDURA-A-${Date.now()}`, 'A');
    tenantB = await crearTenant(dataSource, `EDURA-B-${Date.now()}`, 'B');
  });

  afterAll(async () => {
    if (dataSource && tenantA && tenantB) {
      await limpiarTenant(dataSource, tenantA).catch(() => undefined);
      await limpiarTenant(dataSource, tenantB).catch(() => undefined);
    }
    if (app) {
      await app.close();
    }
  });

  async function obtenerTokenConContexto(
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
    const contextoSeleccionado = listaContextos.find(
      (contexto) =>
        contexto.ambito === 'INSTITUCION' &&
        contexto.institucionId === institucionId &&
        contexto.sedeId === null,
    );
    if (!contextoSeleccionado) {
      throw new Error(
        `No se encontro el contexto de prueba para ${correo}. Contextos: ${JSON.stringify(contextos)}`,
      );
    }

    const contextoRes = await request(app.getHttpServer())
      .post('/api/v1/autenticacion/seleccionar-contexto')
      .set('Authorization', `Bearer ${tokenPrecontexto}`)
      .send(contextoSeleccionado)
      .expect(201);

    return (contextoRes.body as { accessToken: string }).accessToken;
  }

  it('token A ve y modifica solo su tenant y bloquea el tenant B', async () => {
    const tokenA = await obtenerTokenConContexto(
      tenantA.correo,
      tenantA.clave,
      tenantA.institucionId,
    );
    const tokenB = await obtenerTokenConContexto(
      tenantB.correo,
      tenantB.clave,
      tenantB.institucionId,
    );

    const listadoA = await request(app.getHttpServer())
      .get('/api/v1/personas')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    const idsA = (listadoA.body as { datos: { id: string }[] }).datos.map(
      (item) => item.id,
    );
    expect(idsA).toContain(tenantA.personaId);
    expect(idsA).not.toContain(tenantB.personaId);

    await request(app.getHttpServer())
      .get(`/api/v1/personas/${tenantB.personaId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);

    await request(app.getHttpServer())
      .post(`/api/v1/personas/${tenantB.personaId}/documentos`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        tipoDocumentoId: randomUUID(),
        numero: '12345678',
        esPrincipal: true,
      })
      .expect(404);

    await request(app.getHttpServer())
      .get('/api/v1/personas')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/instituciones/${tenantB.institucionId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);

    await request(app.getHttpServer())
      .get(`/api/v1/instituciones/${tenantA.institucionId}/sedes`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/instituciones/${tenantB.institucionId}/sedes`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
  });

  it('rechaza endpoints privados sin token', async () => {
    await request(app.getHttpServer()).get('/api/v1/personas').expect(401);
    await request(app.getHttpServer()).get('/api/v1/instituciones').expect(401);
    await request(app.getHttpServer())
      .get(`/api/v1/instituciones/${tenantA.institucionId}/sedes`)
      .expect(401);
  });
});
