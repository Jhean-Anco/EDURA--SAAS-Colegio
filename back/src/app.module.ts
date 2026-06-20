import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { TypeOrmDatabaseModule } from './base-datos/typeorm/typeorm.module';
import { SaludModule } from './salud/salud.module';
import { CompartidoModule } from './compartido/compartido.module';
import { EstructuraInstitucionalModule } from './modulos/estructura-institucional/estructura-institucional.module';
import { InfraestructuraFisicaModule } from './modulos/infraestructura-fisica/infraestructura-fisica.module';
import { IdentidadAccesoModule } from './modulos/identidad-acceso/identidad-acceso.module';
import { PersonasModule } from './modulos/personas/personas.module';
import { IntegracionesExternasModule } from './modulos/integraciones-externas/integraciones-externas.module';
import { PanelInstitucionalModule } from './modulos/panel-institucional/panel-institucional.module';
import { EstudiantesModule } from './modulos/estudiantes/estudiantes.module';
import { GuardiaJwt } from './modulos/identidad-acceso/presentacion/http/guardias/guardia-jwt';
import { GuardiaPermisos } from './compartido/presentacion/http/guardias/guardia-permisos';

@Module({
  imports: [
    ConfiguracionModule,
    TypeOrmDatabaseModule,
    SaludModule,
    CompartidoModule,
    EstructuraInstitucionalModule,
    InfraestructuraFisicaModule,
    IdentidadAccesoModule,
    PersonasModule,
    IntegracionesExternasModule,
    PanelInstitucionalModule,
    EstudiantesModule,
  ],
  providers: [
    { provide: APP_GUARD, useExisting: GuardiaJwt },
    { provide: APP_GUARD, useExisting: GuardiaPermisos },
  ],
})
export class AppModule {}
