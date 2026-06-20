import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfiguracionAplicacion } from './configuracion/configuracion-aplicacion';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configuracion = app.get(ConfiguracionAplicacion);

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false,
    }),
  );

  const documentacion = new DocumentBuilder()
    .setTitle('API EDURA')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, documentacion);
  SwaggerModule.setup('api/documentacion', app, swaggerDocument);

  const puerto = configuracion.puertoApi;
  await app.listen(puerto);
}

void bootstrap();
