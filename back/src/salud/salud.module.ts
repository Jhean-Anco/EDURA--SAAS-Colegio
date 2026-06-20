import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './salud.controlador';
import { IndicadorBaseDatos } from './indicadores/indicador-base-datos.service';
import { TypeOrmDatabaseModule } from '../base-datos/typeorm/typeorm.module';

@Module({
  imports: [TerminusModule, TypeOrmDatabaseModule],
  controllers: [HealthController],
  providers: [IndicadorBaseDatos],
})
export class SaludModule {}
