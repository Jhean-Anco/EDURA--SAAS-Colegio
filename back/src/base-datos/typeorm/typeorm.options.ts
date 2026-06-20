import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { entidadesTypeOrm } from './typeorm.registro';
import { ConfiguracionAplicacion } from '../../configuracion/configuracion-aplicacion';

export const configuracionTypeOrm = (): DataSourceOptions => {
  const configuracion = new ConfiguracionAplicacion();
  return {
    type: 'postgres',
    host: configuracion.bdHost,
    port: configuracion.bdPuerto,
    username: configuracion.bdUsuario,
    password: configuracion.bdClave,
    database: configuracion.bdNombre,
    ssl: configuracion.bdSsl ? { rejectUnauthorized: false } : false,
    synchronize: false,
    migrationsRun: false,
    logging: configuracion.bdRegistroConsultas,
    entities: entidadesTypeOrm as unknown as NonNullable<
      DataSourceOptions['entities']
    >,
    migrations: [join(__dirname, 'migraciones/*{.ts,.js}')],
    migrationsTableName: 'migraciones_aplicadas',
  };
};
