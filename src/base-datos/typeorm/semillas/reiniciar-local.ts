import { ejecutarSemilla } from './sembrar';

const entorno = process.env.ENTORNO;
const permiteReinicio = process.env.PERMITIR_REINICIO_BD_LOCAL === 'true';

if (!permiteReinicio || (entorno !== 'desarrollo' && entorno !== 'test')) {
  throw new Error(
    'db:reseed:local solo puede ejecutarse con PERMITIR_REINICIO_BD_LOCAL=true y ENTORNO=desarrollo o test',
  );
}

void ejecutarSemilla();
