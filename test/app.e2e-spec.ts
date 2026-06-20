import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfiguracionAplicacion } from '../src/configuracion/configuracion-aplicacion';
import { AppModule } from '../src/app.module';
import { configurarAplicacion } from '../src/configuracion/configurar-aplicacion';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.SWAGGER_HABILITADO = 'true';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacion(app, app.get(ConfiguracionAplicacion));
    await app.init();
  });

  it('GET /api/v1/salud', () => {
    return request(app.getHttpServer()).get('/api/v1/salud').expect(200);
  });

  it('GET /api/documentacion', () => {
    return request(app.getHttpServer()).get('/api/documentacion').expect(200);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});
