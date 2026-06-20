import { Module } from '@nestjs/common';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { TypeOrmDatabaseModule } from './base-datos/typeorm/typeorm.module';
import { SaludModule } from './salud/salud.module';
import { EstructuraInstitucionalModule } from './modulos/estructura-institucional/estructura-institucional.module';
import { InfraestructuraFisicaModule } from './modulos/infraestructura-fisica/infraestructura-fisica.module';

@Module({
  imports: [
    ConfiguracionModule,
    TypeOrmDatabaseModule,
    SaludModule,
    EstructuraInstitucionalModule,
    InfraestructuraFisicaModule,
  ],
})
export class AppModule {}
