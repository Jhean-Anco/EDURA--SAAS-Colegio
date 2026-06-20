import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import fuenteDatos from '../fuente-datos';
import {
  entornoPermiteSemillasDemo,
  normalizarCorreo,
} from './utilidades-semilla';

async function ejecutarDemo(): Promise<void> {
  const entorno = process.env['NODE_ENV'] ?? 'development';

  if (!entornoPermiteSemillasDemo(entorno)) {
    throw new Error(
      `La semilla demo solo se ejecuta en entornos de desarrollo/test. NODE_ENV=${entorno}`,
    );
  }

  if (!fuenteDatos.isInitialized) {
    await fuenteDatos.initialize();
  }

  await fuenteDatos.transaction(async (manager) => {
    const codigoDemo = 'DEMO';
    const [instExistente] = await manager.query<{ id: string }[]>(
      `SELECT id FROM instituciones_educativas WHERE codigo = $1 LIMIT 1`,
      [codigoDemo],
    );

    if (instExistente) {
      console.log('Datos demo ya existen. Sin cambios (idempotente).');
      return;
    }

    const institucionId = randomUUID();
    await manager.query(
      `INSERT INTO instituciones_educativas
         (id, codigo, nombre, nombre_corto, ruc, estado, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, 'Institucion Demo', 'DEMO', '00000000000', 'ACTIVA', now(), now())`,
      [institucionId, codigoDemo],
    );

    const sedeId = randomUUID();
    await manager.query(
      `INSERT INTO sedes
         (id, id_institucion_educativa, nombre, codigo, estado, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, 'Sede Principal Demo', 'DEMO-001', 'ACTIVA', now(), now())`,
      [sedeId, institucionId],
    );

    const usuarioAdminId = randomUUID();
    const correoAdmin = normalizarCorreo('admin.demo@institucion.local');
    const correoPersona = normalizarCorreo('persona.demo@institucion.local');
    const hashClave = await argon2.hash('Demo@2024!', {
      type: argon2.argon2id,
    });
    await manager.query(
      `INSERT INTO usuarios
         (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'Admin Demo', 'ACTIVO', false, 1, now(), now())
       ON CONFLICT (correo_normalizado) DO UPDATE
         SET correo = EXCLUDED.correo,
             nombre_mostrado = EXCLUDED.nombre_mostrado,
             estado = 'ACTIVO',
             version_seguridad = GREATEST(usuarios.version_seguridad, EXCLUDED.version_seguridad),
             fecha_modificacion = now()`,
      [usuarioAdminId, correoAdmin, correoAdmin],
    );
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
      [usuarioAdminId, hashClave],
    );

    const membresiaId = randomUUID();
    await manager.query(
      `INSERT INTO membresias_institucion
         (id, id_usuario, id_institucion_educativa, estado, fecha_inicio, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, $3, 'ACTIVA', CURRENT_DATE, now(), now())
       ON CONFLICT (id_usuario, id_institucion_educativa) DO UPDATE
         SET estado = 'ACTIVA',
             fecha_inicio = COALESCE(membresias_institucion.fecha_inicio, CURRENT_DATE),
             fecha_actualizacion = now()`,
      [membresiaId, usuarioAdminId, institucionId],
    );

    const [rolAdmin] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_INSTITUCION' LIMIT 1`,
    );
    if (rolAdmin) {
      await manager.query(
        `INSERT INTO asignaciones_rol_usuario
           (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
         SELECT $1, $2, $3, m.id, NULL, 'ACTIVA', CURRENT_DATE, now()
           FROM membresias_institucion m
          WHERE m.id_usuario = $2 AND m.id_institucion_educativa = $4
          ON CONFLICT DO NOTHING`,
        [randomUUID(), usuarioAdminId, rolAdmin.id, institucionId],
      );
    }

    const [tipoDoc] = await manager.query<{ id: string }[]>(
      `SELECT id FROM tipos_documento_identidad WHERE codigo = 'DNI' LIMIT 1`,
    );

    const personaId = randomUUID();
    await manager.query(
      `INSERT INTO personas
         (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno,
          fecha_nacimiento, sexo, estado, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, 'Persona', 'Demo', 'Ejemplo', '1990-01-01', 'NO_ESPECIFICADO', 'ACTIVA', now(), now())`,
      [personaId, institucionId],
    );

    if (tipoDoc) {
      await manager.query(
        `INSERT INTO documentos_identidad_persona
           (id, id_persona, id_institucion_educativa, id_tipo_documento_identidad,
            numero, numero_normalizado, es_principal, estado, fecha_creacion, fecha_actualizacion)
         VALUES ($1, $2, $3, $4, '00000001', '00000001', true, 'ACTIVO', now(), now())
         ON CONFLICT DO NOTHING`,
        [randomUUID(), personaId, institucionId, tipoDoc.id],
      );
    }

    await manager.query(
      `INSERT INTO medios_contacto_persona
         (id, id_persona, id_institucion_educativa, tipo, valor, valor_normalizado,
          es_principal, estado, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, $3, 'CORREO', $4, $5, true, 'ACTIVO', now(), now())
       ON CONFLICT DO NOTHING`,
      [randomUUID(), personaId, institucionId, correoPersona, correoPersona],
    );

    await manager.query(
      `INSERT INTO direcciones_persona
         (id, id_persona, id_institucion_educativa, direccion_linea, referencia,
          es_principal, estado, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, $3, 'Av. Demo 000, Ciudad Demo', 'Referencia de ejemplo',
               true, 'ACTIVA', now(), now())
       ON CONFLICT DO NOTHING`,
      [randomUUID(), personaId, institucionId],
    );

    console.log(`Datos demo creados. Institucion id=${institucionId}`);
  });
}

if (require.main === module) {
  ejecutarDemo()
    .then(() => fuenteDatos.destroy())
    .catch(async (error) => {
      if (fuenteDatos.isInitialized) {
        await fuenteDatos.destroy().catch(() => undefined);
      }
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}

export { ejecutarDemo };
