import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import fuenteDatos from '../fuente-datos';

const ENTORNOS_PERMITIDOS = ['desarrollo', 'test', 'development'];

async function ejecutarDemo(): Promise<void> {
  const entorno = process.env['NODE_ENV'] ?? 'development';

  if (!ENTORNOS_PERMITIDOS.includes(entorno)) {
    throw new Error(
      `La semilla demo solo se ejecuta en entornos de desarrollo/test. NODE_ENV=${entorno}`,
    );
  }

  if (!fuenteDatos.isInitialized) {
    await fuenteDatos.initialize();
  }

  await fuenteDatos.transaction(async (manager) => {
    const [instExistente] = await manager.query<{ id: string }[]>(
      `SELECT id FROM instituciones_educativas WHERE ruc = '00000000000' LIMIT 1`,
    );

    if (instExistente) {
      console.log('Datos demo ya existen. Sin cambios (idempotente).');
      return;
    }

    const institucionId = randomUUID();
    await manager.query(
      `INSERT INTO instituciones_educativas
         (id, nombre, nombre_corto, ruc, estado, fecha_creacion, fecha_actualizacion)
       VALUES ($1, 'Institución Demo', 'DEMO', '00000000000', 'ACTIVA', now(), now())`,
      [institucionId],
    );

    const sedeId = randomUUID();
    await manager.query(
      `INSERT INTO sedes
         (id, id_institucion_educativa, nombre, codigo, estado, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, 'Sede Principal Demo', 'DEMO-001', 'ACTIVA', now(), now())`,
      [sedeId, institucionId],
    );

    const usuarioAdminId = randomUUID();
    const hashClave = await argon2.hash('Demo@2024!', {
      type: argon2.argon2id,
    });
    await manager.query(
      `INSERT INTO usuarios (id, correo_electronico, nombre_mostrado, estado, version_seguridad, fecha_creacion, fecha_actualizacion)
       VALUES ($1, 'admin.demo@institucion.local', 'Admin Demo', 'ACTIVO', 1, now(), now())`,
      [usuarioAdminId],
    );
    await manager.query(
      `INSERT INTO credenciales_usuario (id, id_usuario, tipo, hash_clave, activo, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, 'CLAVE_HASH', $3, true, now(), now())`,
      [randomUUID(), usuarioAdminId, hashClave],
    );

    const membresiaId = randomUUID();
    await manager.query(
      `INSERT INTO membresias_institucion
         (id, id_usuario, id_institucion_educativa, estado, fecha_inicio, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, $3, 'ACTIVA', CURRENT_DATE, now(), now())`,
      [membresiaId, usuarioAdminId, institucionId],
    );

    const [rolAdmin] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_INSTITUCION' LIMIT 1`,
    );
    if (rolAdmin) {
      await manager.query(
        `INSERT INTO asignaciones_rol_usuario
           (id, id_usuario, id_rol, id_membresia_institucion, id_sede, ambito, estado, fecha_inicio, fecha_creacion, fecha_actualizacion)
         VALUES ($1, $2, $3, $4, NULL, 'INSTITUCION', 'ACTIVA', CURRENT_DATE, now(), now())`,
        [randomUUID(), usuarioAdminId, rolAdmin.id, membresiaId],
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
         VALUES ($1, $2, $3, $4, '00000001', '00000001', true, 'ACTIVO', now(), now())`,
        [randomUUID(), personaId, institucionId, tipoDoc.id],
      );
    }

    await manager.query(
      `INSERT INTO medios_contacto_persona
         (id, id_persona, id_institucion_educativa, tipo, valor, valor_normalizado,
          es_principal, estado, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, $3, 'CORREO', 'persona.demo@institucion.local', 'persona.demo@institucion.local',
               true, 'ACTIVO', now(), now())`,
      [randomUUID(), personaId, institucionId],
    );

    await manager.query(
      `INSERT INTO direcciones_persona
         (id, id_persona, id_institucion_educativa, direccion_linea, referencia,
          es_principal, estado, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, $3, 'Av. Demo 000, Ciudad Demo', 'Referencia de ejemplo',
               true, 'ACTIVA', now(), now())`,
      [randomUUID(), personaId, institucionId],
    );

    console.log(`Datos demo creados. Institución id=${institucionId}`);
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
