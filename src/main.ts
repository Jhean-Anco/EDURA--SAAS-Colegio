import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfiguracionAplicacion } from './configuracion/configuracion-aplicacion';
import { configurarAplicacion } from './configuracion/configurar-aplicacion';
import { ValidationPipe } from '@nestjs/common';
import { InterceptorSolicitudes } from './compartido/presentacion/http/interceptores/interceptor-solicitudes';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configuracion = app.get(ConfiguracionAplicacion);
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: configuracion.origenesCors,
    credentials: true,
  });
  const httpInstance = app.getHttpAdapter().getInstance() as {
    set: (clave: string, valor: number) => void;
  };
  httpInstance.set('trust proxy', 1);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new InterceptorSolicitudes());
  app.enableShutdownHooks();
  configurarAplicacion(app, configuracion);

  const puerto = configuracion.puertoApi;
  await app.listen(puerto);
}

void bootstrap();
