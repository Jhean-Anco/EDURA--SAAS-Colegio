import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FiltroHttpGlobal } from '../compartido/presentacion/http/filtros/filtro-http.global';

export function configurarAplicacion(
  app: INestApplication,
  documentar = true,
): void {
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false,
    }),
  );
  app.useGlobalFilters(new FiltroHttpGlobal());

  if (documentar) {
    const documentacion = new DocumentBuilder()
      .setTitle('API EDURA')
      .setVersion('1.0')
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, documentacion);
    SwaggerModule.setup('api/documentacion', app, swaggerDocument);
  }
}
