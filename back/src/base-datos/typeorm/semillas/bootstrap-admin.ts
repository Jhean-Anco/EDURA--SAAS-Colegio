import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import fuenteDatos from '../fuente-datos';
import { normalizarCorreo } from './utilidades-semilla';

async function ejecutarBootstrapAdmin(): Promise<void> {
  const correo = process.env['BOOTSTRAP_ADMIN_CORREO'];
  const clave = process.env['BOOTSTRAP_ADMIN_CLAVE'];
  const nombre = process.env['BOOTSTRAP_ADMIN_NOMBRE'] ?? 'Administrador';
  const correoVerificado =
    (process.env['BOOTSTRAP_ADMIN_CORREO_VERIFICADO'] ?? 'false') === 'true';

  if (!correo || !clave) {
    throw new Error(
      'Variables requeridas: BOOTSTRAP_ADMIN_CORREO, BOOTSTRAP_ADMIN_CLAVE',
    );
  }

  if (!fuenteDatos.isInitialized) {
    await fuenteDatos.initialize();
  }

  await fuenteDatos.transaction(async (manager) => {
    const correoNormalizado = normalizarCorreo(correo);
    const [existente] = await manager.query<{ id: string }[]>(
      `SELECT id FROM usuarios WHERE correo_normalizado = $1 LIMIT 1`,
      [correoNormalizado],
    );

    const [rolPropietario] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'PROPIETARIO_PLATAFORMA' LIMIT 1`,
    );
    if (!rolPropietario) {
      throw new Error(
        'Rol PROPIETARIO_PLATAFORMA no encontrado. Ejecute db:seed:seguridad primero.',
      );
    }

    const usuarioId = existente?.id ?? randomUUID();
    if (!existente) {
      await manager.query(
        `INSERT INTO usuarios
           (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, 'ACTIVO', $5, 1, now(), now())`,
        [
          usuarioId,
          correo.trim(),
          correoNormalizado,
          nombre.trim(),
          correoVerificado,
        ],
      );
    } else {
      await manager.query(
        `UPDATE usuarios
            SET correo = $2,
                nombre_mostrado = $3,
                estado = 'ACTIVO',
                correo_verificado = correo_verificado OR $4,
                version_seguridad = GREATEST(version_seguridad, 1),
                fecha_modificacion = now()
          WHERE id = $1`,
        [usuarioId, correo.trim(), nombre.trim(), correoVerificado],
      );
    }

    const hashClave = await argon2.hash(clave, { type: argon2.argon2id });
    await manager.query(
      `INSERT INTO credenciales_usuario
         (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
       VALUES ($1, $2, 'ARGON2ID', true, 0, now(), now())
       ON CONFLICT (id_usuario) DO UPDATE
         SET hash_clave = EXCLUDED.hash_clave,
             algoritmo = EXCLUDED.algoritmo,
             requiere_cambio = true,
             intentos_fallidos = 0,
             fecha_cambio_clave = now(),
             fecha_modificacion = now()`,
      [usuarioId, hashClave],
    );

    const [asignacion] = await manager.query<{ id: string }[]>(
      `SELECT id
         FROM asignaciones_rol_usuario
        WHERE id_usuario = $1
          AND id_rol = $2
          AND id_membresia_institucion IS NULL
          AND id_sede IS NULL
        LIMIT 1`,
      [usuarioId, rolPropietario.id],
    );

    if (!asignacion) {
      await manager.query(
        `INSERT INTO asignaciones_rol_usuario
           (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
         VALUES ($1, $2, $3, NULL, NULL, 'ACTIVA', CURRENT_DATE, now())`,
        [randomUUID(), usuarioId, rolPropietario.id],
      );
    }

    console.log('Usuario bootstrap asegurado para PROPIETARIO_PLATAFORMA.');
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
