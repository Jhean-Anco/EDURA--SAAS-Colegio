import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configurarAplicacion } from '../src/configuracion/configurar-aplicacion';
import { PanelInstitucionalRespuesta } from '../src/modulos/panel-institucional/presentacion/http/respuestas/panel-institucional.respuesta';

const SKIP_E2E = !process.env['BD_HOST'];
const describeE2E = SKIP_E2E ? describe.skip : describe;

async function asegurarTablasPanel(dataSource: DataSource) {
  await dataSource.query(`CREATE TABLE IF NOT EXISTS alertas_institucionales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_institucion_educativa uuid NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    id_sede uuid,
    tipo varchar(40) NOT NULL,
    titulo varchar(160) NOT NULL,
    descripcion text,
    prioridad varchar(20) NOT NULL,
    estado varchar(20) NOT NULL,
    modulo_origen varchar(80) NOT NULL,
    id_recurso_origen varchar(100),
    fecha_generacion timestamptz NOT NULL DEFAULT now(),
    fecha_resolucion timestamptz,
    fecha_creacion timestamptz NOT NULL DEFAULT now(),
    fecha_modificacion timestamptz NOT NULL DEFAULT now()
  )`);
  await dataSource.query(`CREATE TABLE IF NOT EXISTS comunicados_institucionales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_institucion_educativa uuid NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    id_sede uuid,
    titulo varchar(160) NOT NULL,
    contenido text NOT NULL,
    tipo varchar(40) NOT NULL,
    prioridad varchar(20) NOT NULL,
    estado varchar(20) NOT NULL,
    fecha_publicacion timestamptz,
    id_usuario_creador uuid,
    fecha_creacion timestamptz NOT NULL DEFAULT now(),
    fecha_modificacion timestamptz NOT NULL DEFAULT now()
  )`);

  await dataSource.query(
    `INSERT INTO permisos (codigo, recurso, accion, descripcion, activo)
     VALUES ('PANEL_INSTITUCIONAL.RESUMEN.LEER', 'PANEL_INSTITUCIONAL', 'RESUMEN.LEER', 'Ver el resumen del panel institucional', true)
     ON CONFLICT (codigo) DO UPDATE
       SET recurso = EXCLUDED.recurso,
           accion = EXCLUDED.accion,
           descripcion = EXCLUDED.descripcion,
           activo = true`,
  );
  await dataSource.query(
    `INSERT INTO roles_permisos (id_rol, id_permiso)
     SELECT r.id, p.id
       FROM roles r
       JOIN permisos p ON p.codigo = 'PANEL_INSTITUCIONAL.RESUMEN.LEER'
      WHERE r.codigo IN ('ADMINISTRADOR_INSTITUCION', 'DIRECTOR_SEDE')
     ON CONFLICT DO NOTHING`,
  );
}

describeE2E('Panel institucional E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let ds: DataSource;
  const cleanup: Array<{
    usuarioId: string;
    membresiaId: string;
    institucionId: string;
    sedeId: string;
  }> = [];

  async function crearContexto(sufijo: string, sedeId?: string) {
    const institucionId = randomUUID();
    const usuarioId = randomUUID();
    const membresiaId = randomUUID();
    const correo = `panel-${sufijo}-${randomUUID().slice(0, 8)}@test.edura.local`;
    const clave = 'ClavePanel@2026!';
    const sedePrincipalId = sedeId ?? randomUUID();
    const codigoInstitucion = `IE-PANEL-${sufijo}-${randomUUID().slice(0, 8)}`;
    const codigoSede = `SEDE-${sufijo}-${randomUUID().slice(0, 8)}`;

    await ds.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO instituciones_educativas (id, codigo, nombre_legal, nombre_corto, estado, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, 'ACTIVA', now(), now())`,
        [
          institucionId,
          codigoInstitucion,
          `Institucion Panel ${sufijo}`,
          `IP-${sufijo}`,
        ],
      );
      await manager.query(
        `INSERT INTO sedes (id, id_institucion_educativa, codigo, nombre, estado, es_principal, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, 'ACTIVA', true, now(), now())`,
        [sedePrincipalId, institucionId, codigoSede, `Sede ${sufijo}`],
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
      const [rol] = await manager.query<Array<{ id: string }>>(
        `SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_INSTITUCION' LIMIT 1`,
      );
      if (!rol?.id) {
        throw new Error('No se encontro rol ADMINISTRADOR_INSTITUCION');
      }
      await manager.query(
        `INSERT INTO asignaciones_rol_usuario (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVA', CURRENT_DATE, now())`,
        [randomUUID(), usuarioId, rol.id, membresiaId, sedePrincipalId],
      );

      await manager.query(
        `INSERT INTO alertas_institucionales
           (id, id_institucion_educativa, id_sede, tipo, titulo, prioridad, estado, modulo_origen, fecha_generacion, fecha_creacion, fecha_modificacion)
         VALUES
           ($1, $2, $3, 'INFRAESTRUCTURA', 'Alerta 1', 'CRITICA', 'PENDIENTE', 'infraestructura-fisica', now(), now(), now()),
           ($4, $2, $3, 'SISTEMA', 'Alerta 2', 'ALTA', 'PENDIENTE', 'sistema', now() - interval '1 day', now(), now())`,
        [randomUUID(), institucionId, sedePrincipalId, randomUUID()],
      );
    });

    cleanup.push({
      usuarioId,
      membresiaId,
      institucionId,
      sedeId: sedePrincipalId,
    });
    return { correo, clave, institucionId, sedeId: sedePrincipalId };
  }

  async function limpiar() {
    for (const ctx of cleanup) {
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
      await ds.query(`DELETE FROM usuarios WHERE id = $1`, [ctx.usuarioId]);
      await ds.query(
        `DELETE FROM alertas_institucionales WHERE id_institucion_educativa = $1`,
        [ctx.institucionId],
      );
      await ds.query(
        `DELETE FROM comunicados_institucionales WHERE id_institucion_educativa = $1`,
        [ctx.institucionId],
      );
      await ds.query(`DELETE FROM sedes WHERE id = $1`, [ctx.sedeId]);
      await ds.query(`DELETE FROM instituciones_educativas WHERE id = $1`, [
        ctx.institucionId,
      ]);
    }
  }

  async function tokenContexto(
    correo: string,
    clave: string,
    institucionId: string,
  ) {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/autenticacion/iniciar-sesion')
      .send({ correo, clave })
      .expect(201);
    const token = (loginRes.body as { accessToken: string }).accessToken;
    const contextosRes = await request(app.getHttpServer())
      .get('/api/v1/autenticacion/contextos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const contexto = (
      contextosRes.body as Array<{
        ambito: string;
        institucionId: string | null;
        sedeId: string | null;
      }>
    ).find(
      (item) =>
        item.ambito === 'INSTITUCION' &&
        item.institucionId === institucionId &&
        item.sedeId === null,
    );
    if (!contexto) {
      throw new Error('No se encontro contexto');
    }
    const contextoRes = await request(app.getHttpServer())
      .post('/api/v1/autenticacion/seleccionar-contexto')
      .set('Authorization', `Bearer ${token}`)
      .send(contexto)
      .expect(201);
    return (contextoRes.body as { accessToken: string }).accessToken;
  }

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    configurarAplicacion(app, true);
    await app.init();
    ds = modulo.get(DataSource);
    await asegurarTablasPanel(ds);
  });

  afterAll(async () => {
    await limpiar().catch(() => undefined);
    if (app) await app.close();
  });

  it('devuelve resumen estable y filtra por sede', async () => {
    const ctx = await crearContexto('A');
    const token = await tokenContexto(ctx.correo, ctx.clave, ctx.institucionId);

    const res = await request(app.getHttpServer())
      .get('/api/v1/panel-institucional/resumen')
      .query({ idSede: ctx.sedeId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchObject({
      institucion: { id: ctx.institucionId },
      sede: { id: ctx.sedeId },
      indicadores: {
        totalSedesActivas: 1,
        totalUsuariosActivos: 1,
        totalEspaciosFisicosActivos: 0,
        totalEstudiantesActivos: null,
        totalDocentesActivos: null,
        matriculasPorEstado: [],
        asistenciaDelDia: null,
      },
    });
    const cuerpo = res.body as PanelInstitucionalRespuesta;
    expect(cuerpo.indicadores.alertasPendientes).toHaveLength(2);
    expect(cuerpo).not.toHaveProperty('correo');
  });

  it('rechaza sede fuera del contexto', async () => {
    const ctx = await crearContexto('B');
    const token = await tokenContexto(ctx.correo, ctx.clave, ctx.institucionId);
    await request(app.getHttpServer())
      .get('/api/v1/panel-institucional/resumen')
      .query({ idSede: randomUUID() })
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
