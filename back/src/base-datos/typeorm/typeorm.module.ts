import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfiguracionAplicacion } from '../../configuracion/configuracion-aplicacion';
import { entidadesTypeOrm } from './typeorm.registro';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfiguracionAplicacion],
      useFactory: (
        configuracion: ConfiguracionAplicacion,
      ): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: configuracion.bdHost,
        port: configuracion.bdPuerto,
        username: configuracion.bdUsuario,
        password: configuracion.bdClave,
        database: configuracion.bdNombre,
        ssl: configuracion.bdSsl ? { rejectUnauthorized: false } : false,
        synchronize: false,
        migrationsRun: false,
        manualInitialization: configuracion.entorno === 'test',
        logging: configuracion.bdRegistroConsultas,
        entities: entidadesTypeOrm as unknown as NonNullable<
          TypeOrmModuleOptions['entities']
        >,
        migrations: ['dist/base-datos/typeorm/migraciones/*.js'],
      }),
      dataSourceFactory: async (options) => {
        const { DataSource } = await import('typeorm');
        return new DataSource(options!).initialize();
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class TypeOrmDatabaseModule {}
