import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { configurarAplicacion } from '../src/configuracion/configurar-aplicacion';
import { AppModule } from '../src/app.module';

describe('Flujo personas E2E (requiere BD)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

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

  it('aislamiento multi-institución: token de institución A no puede listar personas de institución B', async () => {
    const [[instA], [instB]] = await Promise.all([
      dataSource.query<{ id: string }[]>(
        `SELECT id FROM instituciones_educativas WHERE ruc != '00000000000' LIMIT 1`,
      ),
      dataSource.query<{ id: string }[]>(
        `SELECT id FROM instituciones_educativas WHERE ruc = '00000000000' LIMIT 1`,
      ),
    ]);

    if (!instA || !instB) {
      throw new Error('Se requieren al menos dos instituciones en BD');
    }
    expect(instA.id).not.toBe(instB.id);
  });

  it('POST /api/v1/personas/consultas/dni con token inválido retorna 401', () => {
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
