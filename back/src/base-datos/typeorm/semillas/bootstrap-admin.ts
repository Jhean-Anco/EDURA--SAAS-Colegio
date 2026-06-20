import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import fuenteDatos from '../fuente-datos';

async function ejecutarBootstrapAdmin(): Promise<void> {
  const correo = process.env['BOOTSTRAP_ADMIN_CORREO'];
  const clave = process.env['BOOTSTRAP_ADMIN_CLAVE'];
  const nombre = process.env['BOOTSTRAP_ADMIN_NOMBRE'] ?? 'Administrador';

  if (!correo || !clave) {
    throw new Error(
      'Variables requeridas: BOOTSTRAP_ADMIN_CORREO, BOOTSTRAP_ADMIN_CLAVE',
    );
  }

  if (!fuenteDatos.isInitialized) {
    await fuenteDatos.initialize();
  }

  await fuenteDatos.transaction(async (manager) => {
    const [existente] = await manager.query<{ id: string }[]>(
      `SELECT id FROM usuarios WHERE correo_electronico = $1 LIMIT 1`,
      [correo],
    );

    if (existente) {
      console.log(
        `Usuario bootstrap ya existe (id=${existente.id}). Sin cambios.`,
      );
      return;
    }

    const hashClave = await argon2.hash(clave, { type: argon2.argon2id });

    const usuarioId = randomUUID();
    await manager.query(
      `INSERT INTO usuarios (id, correo_electronico, nombre_mostrado, estado, version_seguridad, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, $3, 'ACTIVO', 1, now(), now())`,
      [usuarioId, correo, nombre],
    );

    const credencialId = randomUUID();
    await manager.query(
      `INSERT INTO credenciales_usuario (id, id_usuario, tipo, hash_clave, activo, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, 'CLAVE_HASH', $3, true, now(), now())`,
      [credencialId, usuarioId, hashClave],
    );

    const [rolPropietario] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'PROPIETARIO_PLATAFORMA' LIMIT 1`,
    );

    if (!rolPropietario) {
      throw new Error(
        'Rol PROPIETARIO_PLATAFORMA no encontrado. Ejecute db:seed:seguridad primero.',
      );
    }

    const asignacionId = randomUUID();
    await manager.query(
      `INSERT INTO asignaciones_rol_usuario
         (id, id_usuario, id_rol, id_membresia_institucion, id_sede, ambito, estado, fecha_inicio, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, $3, NULL, NULL, 'PLATAFORMA', 'ACTIVA', CURRENT_DATE, now(), now())`,
      [asignacionId, usuarioId, rolPropietario.id],
    );

    console.log(`Usuario bootstrap creado (id=${usuarioId}).`);
  });
}

if (require.main === module) {
  ejecutarBootstrapAdmin()
    .then(() => fuenteDatos.destroy())
    .catch(async (error) => {
      if (fuenteDatos.isInitialized) {
        await fuenteDatos.destroy().catch(() => undefined);
      }
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}

export { ejecutarBootstrapAdmin };
