import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { DocentesModule } from './modulos/docentes/docentes.module';
import { EstructuraAcademicaModule } from './modulos/estructura-academica/estructura-academica.module';
import { CurriculoModule } from './modulos/curriculo/curriculo.module';
import { MatriculasModule } from './modulos/matriculas/matriculas.module';
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
    DocentesModule,
    EstructuraAcademicaModule,
    CurriculoModule,
    MatriculasModule,
    ThrottlerModule.forRoot([
      {
        name: 'defecto',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'login',
        ttl: 60000,
        limit: 5,
      },
      {
        name: 'refresh',
        ttl: 60000,
        limit: 15,
      },
      {
        name: 'recuperacion',
        ttl: 60000,
        limit: 3,
      },
    ]),
  ],
  providers: [
    { provide: APP_GUARD, useExisting: GuardiaJwt },
    { provide: APP_GUARD, useExisting: GuardiaPermisos },
    {
      provide: APP_GUARD,
      useClass: process.env.NODE_ENV === 'test'
        ? class SkipThrottlerGuard extends ThrottlerGuard {
            protected override async shouldSkip(): Promise<boolean> {
              return true;
            }
          }
        : ThrottlerGuard,
    },
  ],
})
export class AppModule {}
