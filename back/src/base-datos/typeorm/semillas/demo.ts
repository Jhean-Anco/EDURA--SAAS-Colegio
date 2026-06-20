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

    const personaEstudiante1 = randomUUID();
    const personaEstudiante2 = randomUUID();
    const personaApoderado1 = randomUUID();
    await manager.query(
      `INSERT INTO personas
         (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, estado, fecha_creacion, fecha_actualizacion)
       VALUES
         ($1, $2, 'Ana', 'Perez', 'Lopez', '2010-02-01', 'FEMENINO', 'ACTIVA', now(), now()),
         ($3, $2, 'Bruno', 'Diaz', 'Ruiz', '2011-03-01', 'MASCULINO', 'ACTIVA', now(), now()),
         ($4, $2, 'Carlos', 'Gomez', 'Soto', '1985-04-01', 'MASCULINO', 'ACTIVA', now(), now())
       ON CONFLICT DO NOTHING`,
      [
        personaEstudiante1,
        institucionId,
        personaEstudiante2,
        personaApoderado1,
      ],
    );
    await manager.query(
      `INSERT INTO estudiantes
         (id, id_institucion_educativa, id_sede, id_persona, codigo, estado, fecha_ingreso, observacion, fecha_creacion, fecha_modificacion)
       VALUES
         ($1, $2, $3, $4, 'EST-001', 'ACTIVO', CURRENT_DATE, NULL, now(), now()),
         ($5, $2, $3, $6, 'EST-002', 'ACTIVO', CURRENT_DATE, NULL, now(), now())`,
      [
        randomUUID(),
        institucionId,
        sedeId,
        personaEstudiante1,
        randomUUID(),
        personaEstudiante2,
      ],
    );
    const [estudiantesDemo] = await manager.query<{ id: string }[]>(
      `SELECT id FROM estudiantes WHERE id_institucion_educativa = $1 ORDER BY fecha_creacion ASC LIMIT 1`,
      [institucionId],
    );
    if (estudiantesDemo) {
      await manager.query(
        `INSERT INTO apoderados_estudiante
           (id, id_institucion_educativa, id_estudiante, id_persona, parentesco, es_principal, puede_recoger, recibe_comunicaciones, estado, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, 'MADRE', true, true, true, 'ACTIVO', now(), now())
         ON CONFLICT DO NOTHING`,
        [randomUUID(), institucionId, estudiantesDemo.id, personaApoderado1],
      );
      await manager.query(
        `INSERT INTO documentos_estudiante
           (id, id_institucion_educativa, id_estudiante, tipo_documento, nombre, estado, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, 'Ficha de matrícula', 'Ficha de matrícula 2025', 'PENDIENTE', now(), now())
         ON CONFLICT DO NOTHING`,
        [randomUUID(), institucionId, estudiantesDemo.id],
      );
    }

    await manager.query(
      `INSERT INTO alertas_institucionales
         (id, id_institucion_educativa, id_sede, tipo, titulo, descripcion, prioridad, estado, modulo_origen, id_recurso_origen, fecha_generacion, fecha_creacion, fecha_modificacion)
       VALUES
         ($1, $2, $3, 'INFRAESTRUCTURA', 'Revisión de extintores pendiente', 'Se detectó revisión vencida en almacén principal', 'ALTA', 'PENDIENTE', 'infraestructura-fisica', NULL, now(), now(), now()),
         ($4, $2, $3, 'SEGURIDAD', 'Sesión administrativa expirada', 'Se recomienda renovar la sesión del usuario administrador', 'MEDIA', 'EN_REVISION', 'identidad-acceso', NULL, now(), now(), now()),
         ($5, $2, $3, 'SISTEMA', 'Sincronización de catálogo en cola', 'La sincronización de catálogos está programada para la noche', 'BAJA', 'PENDIENTE', 'base-datos', NULL, now(), now(), now())
       ON CONFLICT DO NOTHING`,
      [randomUUID(), institucionId, sedeId, randomUUID(), randomUUID()],
    );

    await manager.query(
      `INSERT INTO comunicados_institucionales
         (id, id_institucion_educativa, id_sede, titulo, contenido, tipo, prioridad, estado, fecha_publicacion, id_usuario_creador, fecha_creacion, fecha_modificacion)
       VALUES
         ($1, $2, $3, 'Inicio de proceso de matrícula', 'Se publicará el cronograma oficial durante la semana.', 'GENERAL', 'ALTA', 'PUBLICADO', now() - interval '2 days', $4, now(), now()),
         ($5, $2, NULL, 'Mantenimiento programado', 'La plataforma tendrá mantenimiento el sábado a las 22:00.', 'SISTEMA', 'MEDIA', 'PUBLICADO', now() - interval '1 day', $4, now(), now())
       ON CONFLICT DO NOTHING`,
      [randomUUID(), institucionId, sedeId, usuarioAdminId, randomUUID()],
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
