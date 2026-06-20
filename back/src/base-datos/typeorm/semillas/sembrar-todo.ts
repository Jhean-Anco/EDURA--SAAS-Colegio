import fuenteDatos from '../fuente-datos';
import { ejecutarSemilla } from './sembrar';
import { ejecutarBootstrapAdmin } from './bootstrap-admin';
import { ejecutarDemo } from './demo';
import { entornoPermiteSemillasDemo } from './utilidades-semilla';

async function sembrarTodo(): Promise<void> {
  if (!fuenteDatos.isInitialized) {
    await fuenteDatos.initialize();
  }

  await ejecutarSemilla(fuenteDatos);

  const hayBootstrap =
    process.env['BOOTSTRAP_ADMIN_CORREO'] &&
    process.env['BOOTSTRAP_ADMIN_CLAVE'];

  if (hayBootstrap) {
    await ejecutarBootstrapAdmin();
  }

  const entorno = process.env['NODE_ENV'] ?? 'development';
  if (entornoPermiteSemillasDemo(entorno)) {
    await ejecutarDemo();
  }

  await fuenteDatos.destroy();
}

if (require.main === module) {
  sembrarTodo().catch(async (error) => {
    if (fuenteDatos.isInitialized) {
      await fuenteDatos.destroy().catch(() => undefined);
    }
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
