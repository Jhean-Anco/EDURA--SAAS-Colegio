import { ejecutarSemilla } from './sembrar';

if (process.env.ENTORNO === 'produccion') {
  throw new Error('db:reset:local no puede ejecutarse en produccion');
}

void ejecutarSemilla();
