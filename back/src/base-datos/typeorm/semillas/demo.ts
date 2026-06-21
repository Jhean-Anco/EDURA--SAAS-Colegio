import * as argon2 from 'argon2';
import fuenteDatos from '../fuente-datos';
import {
  entornoPermiteSemillasDemo,
  normalizarCorreo,
} from './utilidades-semilla';

const CODIGO_INST = 'DEMO';
const CODIGO_SEDE = 'DEMO-001';
const CORREO_ADMIN = normalizarCorreo('admin.demo@institucion.local');
const CORREO_PERSONA = normalizarCorreo('persona.demo@institucion.local');

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
    // ── Institución ───────────────────────────────────────────────────────────
    await manager.query(
      `INSERT INTO instituciones_educativas
         (id, codigo, nombre_legal, nombre_corto, estado, fecha_creacion, fecha_modificacion)
       VALUES (gen_random_uuid(), $1, 'Institución Demo', 'DEMO', 'ACTIVA', now(), now())
       ON CONFLICT (codigo) DO NOTHING`,
      [CODIGO_INST],
    );

    const [inst] = await manager.query<{ id: string }[]>(
      `SELECT id FROM instituciones_educativas WHERE codigo = $1 LIMIT 1`,
      [CODIGO_INST],
    );
    const institucionId: string = inst.id;

    // ── Sede ──────────────────────────────────────────────────────────────────
    await manager.query(
      `INSERT INTO sedes
         (id, id_institucion_educativa, codigo, nombre, es_principal, estado, fecha_creacion, fecha_modificacion)
       VALUES (gen_random_uuid(), $1, $2, 'Sede Principal Demo', true, 'ACTIVA', now(), now())
       ON CONFLICT (id_institucion_educativa, codigo) DO NOTHING`,
      [institucionId, CODIGO_SEDE],
    );

    const [sede] = await manager.query<{ id: string }[]>(
      `SELECT id FROM sedes WHERE id_institucion_educativa = $1 AND codigo = $2 LIMIT 1`,
      [institucionId, CODIGO_SEDE],
    );
    const sedeId: string = sede.id;

    // ── Usuario administrador ─────────────────────────────────────────────────
    const hashClave = await argon2.hash('Demo@2024!', {
      type: argon2.argon2id,
    });

    await manager.query(
      `INSERT INTO usuarios
         (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado,
          version_seguridad, fecha_creacion, fecha_modificacion)
       VALUES (gen_random_uuid(), $1, $1, 'Admin Demo', 'ACTIVO', false, 1, now(), now())
       ON CONFLICT (correo_normalizado) DO UPDATE
         SET nombre_mostrado = 'Admin Demo',
             estado = 'ACTIVO',
             fecha_modificacion = now()`,
      [CORREO_ADMIN],
    );

    const [usuario] = await manager.query<{ id: string }[]>(
      `SELECT id FROM usuarios WHERE correo_normalizado = $1 LIMIT 1`,
      [CORREO_ADMIN],
    );
    const usuarioAdminId: string = usuario.id;

    await manager.query(
      `INSERT INTO credenciales_usuario
         (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos,
          fecha_cambio_clave, fecha_modificacion)
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

    // ── Membresía y rol ───────────────────────────────────────────────────────
    await manager.query(
      `INSERT INTO membresias_institucion
         (id, id_usuario, id_institucion_educativa, estado, fecha_inicio,
          fecha_creacion, fecha_modificacion)
       VALUES (gen_random_uuid(), $1, $2, 'ACTIVA', CURRENT_DATE, now(), now())
       ON CONFLICT (id_usuario, id_institucion_educativa) DO UPDATE
         SET estado = 'ACTIVA',
             fecha_modificacion = now()`,
      [usuarioAdminId, institucionId],
    );

    const [rolAdmin] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_INSTITUCION' LIMIT 1`,
    );
    if (rolAdmin) {
      await manager.query(
        `INSERT INTO asignaciones_rol_usuario
           (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado,
            fecha_inicio, fecha_creacion)
         SELECT gen_random_uuid(), $1, $2, m.id, NULL, 'ACTIVA', CURRENT_DATE, now()
           FROM membresias_institucion m
          WHERE m.id_usuario = $1 AND m.id_institucion_educativa = $3
         ON CONFLICT DO NOTHING`,
        [usuarioAdminId, rolAdmin.id, institucionId],
      );
    }

    // ── Persona administrativa ────────────────────────────────────────────────
    await manager.query(
      `INSERT INTO personas
         (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno,
          fecha_nacimiento, sexo, estado, fecha_creacion, fecha_actualizacion)
       VALUES (gen_random_uuid(), $1, 'Persona', 'Demo', 'Ejemplo',
               '1990-01-01', 'NO_ESPECIFICADO', 'ACTIVA', now(), now())
       ON CONFLICT DO NOTHING`,
      [institucionId],
    );

    const [persona] = await manager.query<{ id: string }[]>(
      `SELECT p.id FROM personas p
       WHERE p.id_institucion_educativa = $1
         AND p.nombres = 'Persona' AND p.apellido_paterno = 'Demo'
       LIMIT 1`,
      [institucionId],
    );

    if (persona) {
      const personaId: string = persona.id;

      const [tipoDoc] = await manager.query<{ id: string }[]>(
        `SELECT id FROM tipos_documento_identidad WHERE codigo = 'DNI' LIMIT 1`,
      );
      if (tipoDoc) {
        await manager.query(
          `INSERT INTO documentos_identidad_persona
             (id, id_persona, id_institucion_educativa, id_tipo_documento,
              numero, numero_normalizado, es_principal, estado, fecha_creacion, fecha_actualizacion)
           VALUES (gen_random_uuid(), $1, $2, $3, '00000001', '00000001', true, 'ACTIVO', now(), now())
           ON CONFLICT DO NOTHING`,
          [personaId, institucionId, tipoDoc.id],
        );
      }

      await manager.query(
        `INSERT INTO medios_contacto_persona
           (id, id_persona, id_institucion_educativa, tipo, valor, valor_normalizado,
            es_principal, estado, fecha_creacion, fecha_actualizacion)
         VALUES (gen_random_uuid(), $1, $2, 'CORREO', $3, $3, true, 'ACTIVO', now(), now())
         ON CONFLICT DO NOTHING`,
        [personaId, institucionId, CORREO_PERSONA],
      );

      await manager.query(
        `INSERT INTO direcciones_persona
           (id, id_persona, id_institucion_educativa, direccion_linea, referencia,
            es_principal, estado, fecha_creacion, fecha_actualizacion)
         VALUES (gen_random_uuid(), $1, $2,
                 'Av. Demo 000, Ciudad Demo', 'Referencia de ejemplo',
                 true, 'ACTIVA', now(), now())
         ON CONFLICT DO NOTHING`,
        [personaId, institucionId],
      );

      // Vincular la persona de admin al usuario administrador
      await manager.query(
        `UPDATE membresias_institucion
           SET id_persona = $1, fecha_modificacion = now()
         WHERE id_usuario = $2
           AND id_institucion_educativa = $3
           AND id_persona IS NULL`,
        [personaId, usuarioAdminId, institucionId],
      );

      // ── Docente demo ──────────────────────────────────────────────────────────
      await manager.query(
        `INSERT INTO docentes
           (id, id_institucion_educativa, id_persona, codigo, codigo_normalizado,
            estado, fecha_ingreso, fecha_creacion, fecha_modificacion)
         VALUES (gen_random_uuid(), $1, $2, 'DOC-001', 'DOC-001',
                 'ACTIVO', CURRENT_DATE, now(), now())
         ON CONFLICT (id_institucion_educativa, codigo_normalizado) DO NOTHING`,
        [institucionId, personaId],
      );

      const [docente] = await manager.query<{ id: string }[]>(
        `SELECT id FROM docentes WHERE id_institucion_educativa = $1 AND codigo_normalizado = 'DOC-001' LIMIT 1`,
        [institucionId],
      );
      if (docente) {
        await manager.query(
          `INSERT INTO asignaciones_docente_sede
             (id, id_institucion_educativa, id_docente, id_sede, es_principal,
              estado, fecha_inicio, fecha_creacion, fecha_modificacion)
           VALUES (gen_random_uuid(), $1, $2, $3, true, 'ACTIVA', CURRENT_DATE, now(), now())
           ON CONFLICT DO NOTHING`,
          [institucionId, docente.id, sedeId],
        );
      }
    }

    // ── Estudiantes demo ──────────────────────────────────────────────────────
    const personasEst: Array<{
      nombres: string;
      ap: string;
      am: string;
      fn: string;
      sexo: string;
    }> = [
      {
        nombres: 'Ana',
        ap: 'Perez',
        am: 'Lopez',
        fn: '2010-02-01',
        sexo: 'FEMENINO',
      },
      {
        nombres: 'Bruno',
        ap: 'Diaz',
        am: 'Ruiz',
        fn: '2011-03-01',
        sexo: 'MASCULINO',
      },
    ];

    for (const [i, pe] of personasEst.entries()) {
      await manager.query(
        `INSERT INTO personas
           (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno,
            fecha_nacimiento, sexo, estado, fecha_creacion, fecha_actualizacion)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'ACTIVA', now(), now())
         ON CONFLICT DO NOTHING`,
        [institucionId, pe.nombres, pe.ap, pe.am, pe.fn, pe.sexo],
      );

      const [pEst] = await manager.query<{ id: string }[]>(
        `SELECT id FROM personas WHERE id_institucion_educativa = $1
           AND nombres = $2 AND apellido_paterno = $3 LIMIT 1`,
        [institucionId, pe.nombres, pe.ap],
      );
      if (pEst) {
        const codigo = `EST-00${i + 1}`;
        await manager.query(
          `INSERT INTO estudiantes
             (id, id_institucion_educativa, id_sede, id_persona, codigo,
              estado, fecha_ingreso, fecha_creacion, fecha_modificacion)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVO', CURRENT_DATE, now(), now())
           ON CONFLICT (id_institucion_educativa, codigo) DO NOTHING`,
          [institucionId, sedeId, pEst.id, codigo],
        );
      }
    }

    // Apoderado para el primer estudiante
    await manager.query(
      `INSERT INTO personas
         (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno,
          fecha_nacimiento, sexo, estado, fecha_creacion, fecha_actualizacion)
       VALUES (gen_random_uuid(), $1, 'Carlos', 'Gomez', 'Soto',
               '1985-04-01', 'MASCULINO', 'ACTIVA', now(), now())
       ON CONFLICT DO NOTHING`,
      [institucionId],
    );

    const [apoderado] = await manager.query<{ id: string }[]>(
      `SELECT id FROM personas WHERE id_institucion_educativa = $1
         AND nombres = 'Carlos' AND apellido_paterno = 'Gomez' LIMIT 1`,
      [institucionId],
    );
    const [estudiantePrincipal] = await manager.query<{ id: string }[]>(
      `SELECT id FROM estudiantes WHERE id_institucion_educativa = $1
         AND codigo = 'EST-001' LIMIT 1`,
      [institucionId],
    );
    if (apoderado && estudiantePrincipal) {
      await manager.query(
        `INSERT INTO apoderados_estudiante
           (id, id_institucion_educativa, id_estudiante, id_persona, parentesco,
            es_principal, puede_recoger, recibe_comunicaciones, estado,
            fecha_creacion, fecha_modificacion)
         VALUES (gen_random_uuid(), $1, $2, $3, 'PADRE', true, true, true, 'ACTIVO', now(), now())
         ON CONFLICT DO NOTHING`,
        [institucionId, estudiantePrincipal.id, apoderado.id],
      );
    }

    // ── Alertas y comunicados demo ────────────────────────────────────────────
    await manager.query(
      `INSERT INTO alertas_institucionales
         (id, id_institucion_educativa, id_sede, tipo, titulo, descripcion, prioridad,
          estado, modulo_origen, id_recurso_origen, fecha_generacion,
          fecha_creacion, fecha_modificacion)
       VALUES
         (gen_random_uuid(), $1, $2, 'INFRAESTRUCTURA', 'Revisión de extintores pendiente',
          'Se detectó revisión vencida en almacén principal', 'ALTA', 'PENDIENTE',
          'infraestructura-fisica', NULL, now(), now(), now()),
         (gen_random_uuid(), $1, $2, 'SEGURIDAD', 'Sesión administrativa expirada',
          'Se recomienda renovar la sesión del usuario administrador', 'MEDIA', 'EN_REVISION',
          'identidad-acceso', NULL, now(), now(), now()),
         (gen_random_uuid(), $1, $2, 'SISTEMA', 'Sincronización de catálogo en cola',
          'La sincronización de catálogos está programada para la noche', 'BAJA', 'PENDIENTE',
          'base-datos', NULL, now(), now(), now())
       ON CONFLICT DO NOTHING`,
      [institucionId, sedeId],
    );

    await manager.query(
      `INSERT INTO comunicados_institucionales
         (id, id_institucion_educativa, id_sede, titulo, contenido, tipo, prioridad,
          estado, fecha_publicacion, id_usuario_creador, fecha_creacion, fecha_modificacion)
       VALUES
         (gen_random_uuid(), $1, $2,
          'Inicio de proceso de matrícula',
          'Se publicará el cronograma oficial durante la semana.',
          'GENERAL', 'ALTA', 'PUBLICADO', now() - interval '2 days', $3, now(), now()),
         (gen_random_uuid(), $1, NULL,
          'Mantenimiento programado',
          'La plataforma tendrá mantenimiento el sábado a las 22:00.',
          'SISTEMA', 'MEDIA', 'PUBLICADO', now() - interval '1 day', $3, now(), now())
       ON CONFLICT DO NOTHING`,
      [institucionId, sedeId, usuarioAdminId],
    );

    console.log(
      `Semilla demo aplicada (idempotente). Institución codigo=${CODIGO_INST} id=${institucionId}`,
    );
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
