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

type Manager = { query: <T>(sql: string, params?: unknown[]) => Promise<T> };

async function sembrarEstructuraAcademica(
  manager: Manager,
  institucionId: string,
  sedeId: string,
): Promise<void> {
  await manager.query(
    `INSERT INTO niveles_educativos
       (id, id_institucion_educativa, codigo, codigo_normalizado, nombre, orden, estado,
        fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, 'PRIMARIA', 'PRIMARIA', 'Educación Primaria', 1, 'ACTIVO', now(), now())
     ON CONFLICT (id_institucion_educativa, codigo_normalizado) DO NOTHING`,
    [institucionId],
  );

  const [nivel] = await manager.query<{ id: string }[]>(
    `SELECT id FROM niveles_educativos
     WHERE id_institucion_educativa = $1 AND codigo_normalizado = 'PRIMARIA' LIMIT 1`,
    [institucionId],
  );
  if (!nivel) return;

  await manager.query(
    `INSERT INTO grados_educativos
       (id, id_institucion_educativa, id_nivel_educativo, codigo, codigo_normalizado,
        nombre, orden, estado, fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, $2, '1ERO', '1ERO', 'Primer Grado', 1, 'ACTIVO', now(), now())
     ON CONFLICT (id_nivel_educativo, codigo_normalizado) DO NOTHING`,
    [institucionId, nivel.id],
  );

  const anioActual = new Date().getFullYear();
  await manager.query(
    `INSERT INTO anios_academicos
       (id, id_institucion_educativa, anio, codigo, codigo_normalizado, nombre, fecha_inicio, fecha_fin,
        estado, fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, $2, $3, $3, $4, $5, $6, 'ACTIVO', now(), now())
     ON CONFLICT (id_institucion_educativa, anio) DO NOTHING`,
    [
      institucionId,
      anioActual,
      anioActual.toString(),
      `Año Académico ${anioActual}`,
      `${anioActual}-03-01`,
      `${anioActual}-12-20`,
    ],
  );

  const [anio] = await manager.query<{ id: string }[]>(
    `SELECT id FROM anios_academicos
     WHERE id_institucion_educativa = $1 AND anio = $2 LIMIT 1`,
    [institucionId, anioActual],
  );
  if (!anio) return;

  await manager.query(
    `INSERT INTO periodos_academicos
       (id, id_institucion_educativa, id_anio_academico, codigo, codigo_normalizado, nombre, tipo,
        orden, fecha_inicio, fecha_fin, estado, fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, $2, 'B1', 'B1', 'Primer Bimestre', 'BIMESTRE',
             1, $3, $4, 'ACTIVO', now(), now())
     ON CONFLICT (id_anio_academico, codigo_normalizado) DO NOTHING`,
    [institucionId, anio.id, `${anioActual}-03-01`, `${anioActual}-04-30`],
  );

  const [grado] = await manager.query<{ id: string }[]>(
    `SELECT id FROM grados_educativos
     WHERE id_institucion_educativa = $1 AND codigo_normalizado = '1ERO' LIMIT 1`,
    [institucionId],
  );
  if (!grado) return;

  await manager.query(
    `INSERT INTO ofertas_grado_sede
       (id, id_institucion_educativa, id_sede, id_grado_educativo, id_anio_academico,
        capacidad_referencial, estado, fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, 30, 'ACTIVA', now(), now())
     ON CONFLICT (id_institucion_educativa, id_sede, id_grado_educativo, id_anio_academico)
     DO NOTHING`,
    [institucionId, sedeId, grado.id, anio.id],
  );

  const [oferta] = await manager.query<{ id: string }[]>(
    `SELECT id FROM ofertas_grado_sede
     WHERE id_institucion_educativa = $1 AND id_sede = $2
       AND id_grado_educativo = $3 AND id_anio_academico = $4 LIMIT 1`,
    [institucionId, sedeId, grado.id, anio.id],
  );
  if (!oferta) return;

  await manager.query(
    `INSERT INTO secciones_academicas
       (id, id_institucion_educativa, id_oferta_grado_sede, codigo, codigo_normalizado, nombre, turno,
        capacidad_maxima, estado, fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, $2, 'A', 'A', 'A', 'MANANA', 25, 'ACTIVA', now(), now())
     ON CONFLICT (id_institucion_educativa, id_oferta_grado_sede, codigo_normalizado) DO NOTHING`,
    [institucionId, oferta.id],
  );

  await manager.query(
    `INSERT INTO secciones_academicas
       (id, id_institucion_educativa, id_oferta_grado_sede, codigo, codigo_normalizado, nombre, turno,
        capacidad_maxima, estado, fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, $2, 'B', 'B', 'B', 'MANANA', 1, 'ACTIVA', now(), now())
     ON CONFLICT (id_institucion_educativa, id_oferta_grado_sede, codigo_normalizado) DO NOTHING`,
    [institucionId, oferta.id],
  );

  // ── Curriculo Demo ────────────────────────────────────────────────────────
  await manager.query(
    `INSERT INTO areas_curriculares
       (id, id_institucion_educativa, codigo, codigo_normalizado, nombre, nombre_normalizado, descripcion, orden, estado, fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, 'MATEMATICA', 'MATEMATICA', 'Matemática', 'MATEMATICA', 'Área de matemática', 1, 'ACTIVA', now(), now())
     ON CONFLICT (id_institucion_educativa, codigo_normalizado) DO NOTHING`,
    [institucionId],
  );

  const [area] = await manager.query<{ id: string }[]>(
    `SELECT id FROM areas_curriculares
     WHERE id_institucion_educativa = $1 AND codigo_normalizado = 'MATEMATICA' LIMIT 1`,
    [institucionId],
  );
  if (!area) return;

  await manager.query(
    `INSERT INTO asignaturas
       (id, id_institucion_educativa, id_area_curricular, codigo, codigo_normalizado, nombre, nombre_corto, descripcion, orden, estado, fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, $2, 'ALGEBRA', 'ALGEBRA', 'Álgebra', 'Álgebra', 'Curso de álgebra', 1, 'ACTIVA', now(), now())
     ON CONFLICT (id_institucion_educativa, codigo_normalizado) DO NOTHING`,
    [institucionId, area.id],
  );

  const [asignatura] = await manager.query<{ id: string }[]>(
    `SELECT id FROM asignaturas
     WHERE id_institucion_educativa = $1 AND codigo_normalizado = 'ALGEBRA' LIMIT 1`,
    [institucionId],
  );
  if (!asignatura) return;

  await manager.query(
    `INSERT INTO planes_estudio
       (id, id_institucion_educativa, id_anio_academico, id_grado_educativo, codigo, codigo_normalizado, nombre, version, estado, observacion, fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, $2, $3, 'PLAN-1ERO-MAT', 'PLAN-1ERO-MAT', 'Plan Primer Grado Matemática', 1, 'BORRADOR', 'Plan demo', now(), now())
     ON CONFLICT (id_institucion_educativa, codigo_normalizado) DO NOTHING`,
    [institucionId, anio.id, grado.id],
  );

  const [plan] = await manager.query<{ id: string }[]>(
    `SELECT id FROM planes_estudio
     WHERE id_institucion_educativa = $1 AND codigo_normalizado = 'PLAN-1ERO-MAT' LIMIT 1`,
    [institucionId],
  );
  if (!plan) return;

  await manager.query(
    `INSERT INTO detalles_plan_estudio
       (id, id_institucion_educativa, id_plan_estudio, id_asignatura, tipo, horas_semanales, horas_anuales, orden, estado, observacion, fecha_creacion, fecha_modificacion)
     VALUES (gen_random_uuid(), $1, $2, $3, 'OBLIGATORIA', 4, 160, 1, 'ACTIVO', 'Detalle demo', now(), now())
     ON CONFLICT DO NOTHING`,
    [institucionId, plan.id, asignatura.id],
  );
}

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
          fecha_nacimiento, sexo_registral, estado, fecha_creacion, fecha_modificacion)
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
              numero, numero_normalizado, es_principal, estado, fecha_creacion, fecha_modificacion)
           VALUES (gen_random_uuid(), $1, $2, $3, '00000001', '00000001', true, 'ACTIVO', now(), now())
           ON CONFLICT DO NOTHING`,
          [personaId, institucionId, tipoDoc.id],
        );
      }

      await manager.query(
        `INSERT INTO medios_contacto_persona
           (id, id_persona, id_institucion_educativa, tipo, valor, valor_normalizado,
            es_principal, estado, fecha_creacion, fecha_modificacion)
         VALUES (gen_random_uuid(), $1, $2, 'CORREO', $3, $3, true, 'ACTIVO', now(), now())
         ON CONFLICT DO NOTHING`,
        [personaId, institucionId, CORREO_PERSONA],
      );

      await manager.query(
        `INSERT INTO direcciones_persona
           (id, id_persona, id_institucion_educativa, direccion_linea, referencia,
            es_principal, estado, fecha_creacion, fecha_modificacion)
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
            fecha_nacimiento, sexo_registral, estado, fecha_creacion, fecha_modificacion)
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
          fecha_nacimiento, sexo_registral, estado, fecha_creacion, fecha_modificacion)
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

    // ── Estructura académica demo ─────────────────────────────────────────────
    await sembrarEstructuraAcademica(manager, institucionId, sedeId);

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

    // ── Matrículas Demo ───────────────────────────────────────────────────────
    const anioActual = new Date().getFullYear();
    const [anio] = await manager.query<{ id: string }[]>(
      `SELECT id FROM anios_academicos WHERE id_institucion_educativa = $1 AND anio = $2 LIMIT 1`,
      [institucionId, anioActual],
    );
    const [grado] = await manager.query<
      { id: string; idNivelEducativo: string }[]
    >(
      `SELECT id, id_nivel_educativo as "idNivelEducativo" FROM grados_educativos WHERE id_institucion_educativa = $1 AND codigo_normalizado = '1ERO' LIMIT 1`,
      [institucionId],
    );

    if (anio && grado) {
      const [oferta] = await manager.query<{ id: string }[]>(
        `SELECT id FROM ofertas_grado_sede WHERE id_institucion_educativa = $1 AND id_sede = $2 AND id_grado_educativo = $3 AND id_anio_academico = $4 LIMIT 1`,
        [institucionId, sedeId, grado.id, anio.id],
      );

      if (oferta) {
        const [secA] = await manager.query<{ id: string }[]>(
          `SELECT id FROM secciones_academicas WHERE id_institucion_educativa = $1 AND id_oferta_grado_sede = $2 AND codigo_normalizado = 'A' LIMIT 1`,
          [institucionId, oferta.id],
        );
        const [secB] = await manager.query<{ id: string }[]>(
          `SELECT id FROM secciones_academicas WHERE id_institucion_educativa = $1 AND id_oferta_grado_sede = $2 AND codigo_normalizado = 'B' LIMIT 1`,
          [institucionId, oferta.id],
        );

        const [est1] = await manager.query<{ id: string }[]>(
          `SELECT id FROM estudiantes WHERE id_institucion_educativa = $1 AND codigo = 'EST-001' LIMIT 1`,
          [institucionId],
        );
        const [est2] = await manager.query<{ id: string }[]>(
          `SELECT id FROM estudiantes WHERE id_institucion_educativa = $1 AND codigo = 'EST-002' LIMIT 1`,
          [institucionId],
        );
        const [est3] = await manager.query<{ id: string }[]>(
          `SELECT id FROM estudiantes WHERE id_institucion_educativa = $1 AND codigo = 'EST-003' LIMIT 1`,
          [institucionId],
        );

        // 1. Matrícula activa en sección A (con capacidad disponible)
        if (est1 && secA) {
          const matId = crypto.randomUUID();
          await manager.query(
            `INSERT INTO matriculas (
              id, id_institucion_educativa, id_sede, id_estudiante, id_anio_academico,
              id_nivel_educativo, id_grado_educativo, id_oferta_grado_sede, id_seccion_academica,
              codigo_matricula, fecha_matricula, estado, observacion, id_usuario_creador,
              id_usuario_activador, fecha_activacion, fecha_creacion, fecha_modificacion
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, 'MAT-DEMO-001', CURRENT_DATE, 'ACTIVA', 'Matricula demo activa', $10, $10, now(), now(), now()
            ) ON CONFLICT (id_institucion_educativa, codigo_matricula) DO NOTHING`,
            [
              matId,
              institucionId,
              sedeId,
              est1.id,
              anio.id,
              grado.idNivelEducativo,
              grado.id,
              oferta.id,
              secA.id,
              usuarioAdminId,
            ],
          );

          // Seed history entry
          const [insertedMat] = await manager.query<{ id: string }[]>(
            `SELECT id FROM matriculas WHERE id_institucion_educativa = $1 AND codigo_matricula = 'MAT-DEMO-001' LIMIT 1`,
            [institucionId],
          );
          if (insertedMat) {
            await manager.query(
              `INSERT INTO historial_estados_matricula (id, id_institucion_educativa, id_matricula, estado_anterior, estado_nuevo, motivo, id_usuario, fecha)
               VALUES (gen_random_uuid(), $1, $2, NULL, 'BORRADOR', 'Creacion', $3, now())
               ON CONFLICT DO NOTHING`,
              [institucionId, insertedMat.id, usuarioAdminId],
            );
            await manager.query(
              `INSERT INTO historial_estados_matricula (id, id_institucion_educativa, id_matricula, estado_anterior, estado_nuevo, motivo, id_usuario, fecha)
               VALUES (gen_random_uuid(), $1, $2, 'BORRADOR', 'ACTIVA', 'Activacion', $3, now() + interval '1 second')
               ON CONFLICT DO NOTHING`,
              [institucionId, insertedMat.id, usuarioAdminId],
            );
            await manager.query(
              `INSERT INTO historial_cambios_seccion_matricula (id, id_institucion_educativa, id_matricula, id_seccion_anterior, id_seccion_nueva, motivo, id_usuario, fecha)
               VALUES (gen_random_uuid(), $1, $2, NULL, $3, 'Asignacion', $4, now())
               ON CONFLICT DO NOTHING`,
              [institucionId, insertedMat.id, secA.id, usuarioAdminId],
            );
          }
        }

        // 2. Matrícula en borrador
        if (est2) {
          const matId = crypto.randomUUID();
          await manager.query(
            `INSERT INTO matriculas (
              id, id_institucion_educativa, id_sede, id_estudiante, id_anio_academico,
              id_nivel_educativo, id_grado_educativo, id_oferta_grado_sede, id_seccion_academica,
              codigo_matricula, fecha_matricula, estado, observacion, id_usuario_creador,
              fecha_creacion, fecha_modificacion
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, NULL, 'MAT-DEMO-002', CURRENT_DATE, 'BORRADOR', 'Matricula demo borrador', $9, now(), now()
            ) ON CONFLICT (id_institucion_educativa, codigo_matricula) DO NOTHING`,
            [
              matId,
              institucionId,
              sedeId,
              est2.id,
              anio.id,
              grado.idNivelEducativo,
              grado.id,
              oferta.id,
              usuarioAdminId,
            ],
          );

          const [insertedMat] = await manager.query<{ id: string }[]>(
            `SELECT id FROM matriculas WHERE id_institucion_educativa = $1 AND codigo_matricula = 'MAT-DEMO-002' LIMIT 1`,
            [institucionId],
          );
          if (insertedMat) {
            await manager.query(
              `INSERT INTO historial_estados_matricula (id, id_institucion_educativa, id_matricula, estado_anterior, estado_nuevo, motivo, id_usuario, fecha)
               VALUES (gen_random_uuid(), $1, $2, NULL, 'BORRADOR', 'Creacion', $3, now())
               ON CONFLICT DO NOTHING`,
              [institucionId, insertedMat.id, usuarioAdminId],
            );
          }
        }

        // 3. Matrícula activa en sección B (capacidad 1, por tanto seccion llena)
        if (est3 && secB) {
          const matId = crypto.randomUUID();
          await manager.query(
            `INSERT INTO matriculas (
              id, id_institucion_educativa, id_sede, id_estudiante, id_anio_academico,
              id_nivel_educativo, id_grado_educativo, id_oferta_grado_sede, id_seccion_academica,
              codigo_matricula, fecha_matricula, estado, observacion, id_usuario_creador,
              id_usuario_activador, fecha_activacion, fecha_creacion, fecha_modificacion
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, 'MAT-DEMO-003', CURRENT_DATE, 'ACTIVA', 'Matricula demo activa llena', $10, $10, now(), now(), now()
            ) ON CONFLICT (id_institucion_educativa, codigo_matricula) DO NOTHING`,
            [
              matId,
              institucionId,
              sedeId,
              est3.id,
              anio.id,
              grado.idNivelEducativo,
              grado.id,
              oferta.id,
              secB.id,
              usuarioAdminId,
            ],
          );

          const [insertedMat] = await manager.query<{ id: string }[]>(
            `SELECT id FROM matriculas WHERE id_institucion_educativa = $1 AND codigo_matricula = 'MAT-DEMO-003' LIMIT 1`,
            [institucionId],
          );
          if (insertedMat) {
            await manager.query(
              `INSERT INTO historial_estados_matricula (id, id_institucion_educativa, id_matricula, estado_anterior, estado_nuevo, motivo, id_usuario, fecha)
               VALUES (gen_random_uuid(), $1, $2, NULL, 'BORRADOR', 'Creacion', $3, now())
               ON CONFLICT DO NOTHING`,
              [institucionId, insertedMat.id, usuarioAdminId],
            );
            await manager.query(
              `INSERT INTO historial_estados_matricula (id, id_institucion_educativa, id_matricula, estado_anterior, estado_nuevo, motivo, id_usuario, fecha)
               VALUES (gen_random_uuid(), $1, $2, 'BORRADOR', 'ACTIVA', 'Activacion', $3, now() + interval '1 second')
               ON CONFLICT DO NOTHING`,
              [institucionId, insertedMat.id, usuarioAdminId],
            );
            await manager.query(
              `INSERT INTO historial_cambios_seccion_matricula (id, id_institucion_educativa, id_matricula, id_seccion_anterior, id_seccion_nueva, motivo, id_usuario, fecha)
               VALUES (gen_random_uuid(), $1, $2, NULL, $3, 'Asignacion', $4, now())
               ON CONFLICT DO NOTHING`,
              [institucionId, insertedMat.id, secB.id, usuarioAdminId],
            );
          }
        }
      }
    }

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
