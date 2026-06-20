import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FiltroHttpGlobal } from '../compartido/presentacion/http/filtros/filtro-http.global';
import { ConfiguracionAplicacion } from './configuracion-aplicacion';

export function configurarAplicacion(
  app: INestApplication,
  configuracion: ConfiguracionAplicacion,
): void {
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new FiltroHttpGlobal());

  if (configuracion.swaggerHabilitado) {
    const documentacion = new DocumentBuilder()
      .setTitle('API EDURA')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, documentacion);
    SwaggerModule.setup('api/documentacion', app, swaggerDocument);
  }
}
