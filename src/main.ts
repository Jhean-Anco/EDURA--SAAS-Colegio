import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfiguracionAplicacion } from './configuracion/configuracion-aplicacion';
import { configurarAplicacion } from './configuracion/configurar-aplicacion';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configuracion = app.get(ConfiguracionAplicacion);
  app.enableShutdownHooks();
  configurarAplicacion(app);

  const puerto = configuracion.puertoApi;
  await app.listen(puerto);
}

void bootstrap();
