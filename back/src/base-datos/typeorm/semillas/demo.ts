import * as argon2 from 'argon2';
import fuenteDatos from '../fuente-datos';
import {
  entornoPermiteSemillasDemo,
  normalizarCorreo,
} from './utilidades-semilla';

// Fallback UUIDs if entities do not exist
const ID_INST_1 = 'd3b07384-d113-43cf-a52d-000000000001';
const ID_SEDE_1 = 'd3b07384-d113-43cf-a52d-000000000002';
const ID_SEDE_2 = 'd3b07384-d113-43cf-a52d-000000000003';

const ID_ADMIN_USER = 'd3b07384-d113-43cf-a52d-000000000004';
const ID_ADMIN_PERSONA = 'd3b07384-d113-43cf-a52d-000000000005';
const ID_ADMIN_MEMBRESIA = 'd3b07384-d113-43cf-a52d-000000000051';

const ID_DIR_1_USER = 'd3b07384-d113-43cf-a52d-000000000006';
const ID_DIR_1_PERSONA = 'd3b07384-d113-43cf-a52d-000000000007';
const ID_DIR_1_MEMBRESIA = 'd3b07384-d113-43cf-a52d-000000000052';

const ID_DIR_2_USER = 'd3b07384-d113-43cf-a52d-000000000008';
const ID_DIR_2_PERSONA = 'd3b07384-d113-43cf-a52d-000000000009';
const ID_DIR_2_MEMBRESIA = 'd3b07384-d113-43cf-a52d-000000000053';

const ID_DOCENTE_USER = 'd3b07384-d113-43cf-a52d-000000000010';
const ID_DOCENTE_PERSONA = 'd3b07384-d113-43cf-a52d-000000000011';
const ID_DOCENTE_MEMBRESIA = 'd3b07384-d113-43cf-a52d-000000000054';
const ID_DOCENTE_REG = 'd3b07384-d113-43cf-a52d-000000000012';

const ID_EST_1_USER = 'd3b07384-d113-43cf-a52d-000000000013';
const ID_EST_1_PERSONA = 'd3b07384-d113-43cf-a52d-000000000014';
const ID_EST_1_MEMBRESIA = 'd3b07384-d113-43cf-a52d-000000000055';
const ID_EST_1_REG = 'd3b07384-d113-43cf-a52d-000000000015';

const ID_EST_2_USER = 'd3b07384-d113-43cf-a52d-000000000016';
const ID_EST_2_PERSONA = 'd3b07384-d113-43cf-a52d-000000000017';
const ID_EST_2_MEMBRESIA = 'd3b07384-d113-43cf-a52d-000000000056';
const ID_EST_2_REG = 'd3b07384-d113-43cf-a52d-000000000018';

const ID_EST_3_USER = 'd3b07384-d113-43cf-a52d-000000000019';
const ID_EST_3_PERSONA = 'd3b07384-d113-43cf-a52d-000000000020';
const ID_EST_3_MEMBRESIA = 'd3b07384-d113-43cf-a52d-000000000057';
const ID_EST_3_REG = 'd3b07384-d113-43cf-a52d-000000000021';

const ID_APODERADO_USER = 'd3b07384-d113-43cf-a52d-000000000022';
const ID_APODERADO_PERSONA = 'd3b07384-d113-43cf-a52d-000000000023';
const ID_APODERADO_MEMBRESIA = 'd3b07384-d113-43cf-a52d-000000000058';
const ID_APODERADO_REL = 'd3b07384-d113-43cf-a52d-000000000024';

const ID_INST_2 = 'd3b07384-d113-43cf-a52d-000000000101';
const ID_SEDE_T2 = 'd3b07384-d113-43cf-a52d-000000000102';
const ID_ADMIN_T2_USER = 'd3b07384-d113-43cf-a52d-000000000103';
const ID_ADMIN_T2_PERSONA = 'd3b07384-d113-43cf-a52d-000000000104';
const ID_ADMIN_T2_MEMBRESIA = 'd3b07384-d113-43cf-a52d-000000000105';

const ID_NIVEL = 'd3b07384-d113-43cf-a52d-000000000201';
const ID_GRADO = 'd3b07384-d113-43cf-a52d-000000000202';
const ID_ANIO = 'd3b07384-d113-43cf-a52d-000000000203';
const ID_PERIODO = 'd3b07384-d113-43cf-a52d-000000000204';
const ID_OFERTA_1 = 'd3b07384-d113-43cf-a52d-000000000205';
const ID_SECCION_A = 'd3b07384-d113-43cf-a52d-000000000206';
const ID_SECCION_B = 'd3b07384-d113-43cf-a52d-000000000207';
const ID_MATRICULA_1 = 'd3b07384-d113-43cf-a52d-000000000208';
const ID_MATRICULA_2 = 'd3b07384-d113-43cf-a52d-000000000209';
const ID_MATRICULA_3 = 'd3b07384-d113-43cf-a52d-000000000210';

const ID_AREA = 'd3b07384-d113-43cf-a52d-000000000211';
const ID_ASIGNATURA = 'd3b07384-d113-43cf-a52d-000000000212';
const ID_PLAN = 'd3b07384-d113-43cf-a52d-000000000213';
const ID_PLAN_DETALLE = 'd3b07384-d113-43cf-a52d-000000000214';

type Manager = { query: <T>(sql: string, params?: unknown[]) => Promise<T> };

async function obtenerOInsertarInstitucion(
  manager: Manager,
  id: string,
  codigo: string,
  nombre: string,
): Promise<string> {
  const [existente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM instituciones_educativas WHERE codigo = $1 LIMIT 1`,
    [codigo],
  );
  if (existente) {
    return existente.id;
  }
  await manager.query(
    `INSERT INTO instituciones_educativas
       (id, codigo, nombre_legal, nombre_corto, estado, fecha_creacion, fecha_modificacion)
     VALUES ($1, $2, $3, $2, 'ACTIVA', now(), now())`,
    [id, codigo, nombre],
  );
  return id;
}

async function obtenerOInsertarSede(
  manager: Manager,
  id: string,
  instId: string,
  codigo: string,
  nombre: string,
  esPrincipal: boolean,
): Promise<string> {
  const [existente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM sedes WHERE id_institucion_educativa = $1 AND codigo = $2 LIMIT 1`,
    [instId, codigo],
  );
  if (existente) {
    return existente.id;
  }
  await manager.query(
    `INSERT INTO sedes
       (id, id_institucion_educativa, codigo, nombre, es_principal, estado, fecha_creacion, fecha_modificacion)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVA', now(), now())`,
    [id, instId, codigo, nombre, esPrincipal],
  );
  return id;
}

async function obtenerOInsertarPersona(
  manager: Manager,
  id: string,
  instId: string,
  nombres: string,
  ap: string,
  am: string,
): Promise<string> {
  const [existente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM personas WHERE id_institucion_educativa = $1 AND nombres = $2 AND apellido_paterno = $3 LIMIT 1`,
    [instId, nombres, ap],
  );
  if (existente) {
    return existente.id;
  }
  await manager.query(
    `INSERT INTO personas
       (id, id_institucion_educativa, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_registral, estado, fecha_creacion, fecha_modificacion)
     VALUES ($1, $2, $3, $4, $5, '1980-01-01', 'NO_ESPECIFICADO', 'ACTIVA', now(), now())`,
    [id, instId, nombres, ap, am],
  );
  return id;
}

async function obtenerOInsertarUsuario(
  manager: Manager,
  id: string,
  correo: string,
  nombre: string,
  hashClave: string,
): Promise<string> {
  const correoNorm = normalizarCorreo(correo);
  const [existente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM usuarios WHERE correo_normalizado = $1 LIMIT 1`,
    [correoNorm],
  );
  if (existente) {
    return existente.id;
  }
  await manager.query(
    `INSERT INTO usuarios
       (id, correo, correo_normalizado, nombre_mostrado, estado, correo_verificado, version_seguridad, fecha_creacion, fecha_modificacion)
     VALUES ($1, $2, $3, $4, 'ACTIVO', true, 1, now(), now())`,
    [id, correo, correoNorm, nombre],
  );
  await manager.query(
    `INSERT INTO credenciales_usuario
       (id_usuario, hash_clave, algoritmo, requiere_cambio, intentos_fallidos, fecha_cambio_clave, fecha_modificacion)
     VALUES ($1, $2, 'ARGON2ID', false, 0, now(), now())
     ON CONFLICT (id_usuario) DO UPDATE SET hash_clave = EXCLUDED.hash_clave`,
    [id, hashClave],
  );
  return id;
}

async function obtenerOInsertarMembresia(
  manager: Manager,
  id: string,
  userId: string,
  instId: string,
  personaId: string,
): Promise<string> {
  const [existente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM membresias_institucion WHERE id_usuario = $1 AND id_institucion_educativa = $2 LIMIT 1`,
    [userId, instId],
  );
  if (existente) {
    await manager.query(
      `UPDATE membresias_institucion SET id_persona = $1 WHERE id = $2 AND id_persona IS NULL`,
      [personaId, existente.id],
    );
    return existente.id;
  }
  await manager.query(
    `INSERT INTO membresias_institucion
       (id, id_usuario, id_institucion_educativa, id_persona, estado, fecha_inicio, fecha_creacion, fecha_modificacion)
     VALUES ($1, $2, $3, $4, 'ACTIVA', CURRENT_DATE, now(), now())`,
    [id, userId, instId, personaId],
  );
  return id;
}

async function sembrarEstructuraAcademica(
  manager: Manager,
  institucionId: string,
  sedeId: string,
): Promise<void> {
  // Nivel
  const [nivelExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM niveles_educativos WHERE id_institucion_educativa = $1 AND codigo_normalizado = 'PRIMARIA' LIMIT 1`,
    [institucionId],
  );
  const nivelId = nivelExistente ? nivelExistente.id : ID_NIVEL;
  if (!nivelExistente) {
    await manager.query(
      `INSERT INTO niveles_educativos
         (id, id_institucion_educativa, codigo, codigo_normalizado, nombre, orden, estado,
          fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, 'PRIMARIA', 'PRIMARIA', 'Educación Primaria', 1, 'ACTIVO', now(), now())`,
      [ID_NIVEL, institucionId],
    );
  }

  // Grado
  const [gradoExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM grados_educativos WHERE id_nivel_educativo = $1 AND codigo_normalizado = '1ERO' LIMIT 1`,
    [nivelId],
  );
  const gradoId = gradoExistente ? gradoExistente.id : ID_GRADO;
  if (!gradoExistente) {
    await manager.query(
      `INSERT INTO grados_educativos
         (id, id_institucion_educativa, id_nivel_educativo, codigo, codigo_normalizado,
          nombre, orden, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, '1ERO', '1ERO', 'Primer Grado', 1, 'ACTIVO', now(), now())`,
      [ID_GRADO, institucionId, nivelId],
    );
  }

  // Año académico
  const anioActual = new Date().getFullYear();
  const [anioExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM anios_academicos WHERE id_institucion_educativa = $1 AND anio = $2 LIMIT 1`,
    [institucionId, anioActual],
  );
  const anioId = anioExistente ? anioExistente.id : ID_ANIO;
  if (!anioExistente) {
    await manager.query(
      `INSERT INTO anios_academicos
         (id, id_institucion_educativa, anio, codigo, codigo_normalizado, nombre, fecha_inicio, fecha_fin,
          estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, $4, $5, $6, $7, 'ACTIVO', now(), now())`,
      [
        ID_ANIO,
        institucionId,
        anioActual,
        anioActual.toString(),
        `Año Académico ${anioActual}`,
        `${anioActual}-03-01`,
        `${anioActual}-12-20`,
      ],
    );
  }

  // Periodo
  const [periodoExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM periodos_academicos WHERE id_anio_academico = $1 AND codigo_normalizado = 'B1' LIMIT 1`,
    [anioId],
  );
  if (!periodoExistente) {
    await manager.query(
      `INSERT INTO periodos_academicos
         (id, id_institucion_educativa, id_anio_academico, codigo, codigo_normalizado, nombre, tipo,
          orden, fecha_inicio, fecha_fin, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'B1', 'B1', 'Primer Bimestre', 'BIMESTRE',
               1, $4, $5, 'ACTIVO', now(), now())`,
      [
        ID_PERIODO,
        institucionId,
        anioId,
        `${anioActual}-03-01`,
        `${anioActual}-04-30`,
      ],
    );
  }

  // Oferta
  const [ofertaExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM ofertas_grado_sede WHERE id_sede = $1 AND id_grado_educativo = $2 AND id_anio_academico = $3 LIMIT 1`,
    [sedeId, gradoId, anioId],
  );
  const ofertaId = ofertaExistente ? ofertaExistente.id : ID_OFERTA_1;
  if (!ofertaExistente) {
    await manager.query(
      `INSERT INTO ofertas_grado_sede
         (id, id_institucion_educativa, id_sede, id_grado_educativo, id_anio_academico,
          capacidad_referencial, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, $5, 30, 'ACTIVA', now(), now())`,
      [ID_OFERTA_1, institucionId, sedeId, gradoId, anioId],
    );
  }

  // Secciones
  const [seccionAExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM secciones_academicas WHERE id_oferta_grado_sede = $1 AND codigo_normalizado = 'A' LIMIT 1`,
    [ofertaId],
  );
  if (!seccionAExistente) {
    await manager.query(
      `INSERT INTO secciones_academicas
         (id, id_institucion_educativa, id_oferta_grado_sede, codigo, codigo_normalizado, nombre, turno,
          capacidad_maxima, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'A', 'A', 'A', 'MANANA', 25, 'ACTIVA', now(), now())`,
      [ID_SECCION_A, institucionId, ofertaId],
    );
  }

  const [seccionBExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM secciones_academicas WHERE id_oferta_grado_sede = $1 AND codigo_normalizado = 'B' LIMIT 1`,
    [ofertaId],
  );
  if (!seccionBExistente) {
    await manager.query(
      `INSERT INTO secciones_academicas
         (id, id_institucion_educativa, id_oferta_grado_sede, codigo, codigo_normalizado, nombre, turno,
          capacidad_maxima, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'B', 'B', 'B', 'MANANA', 1, 'ACTIVA', now(), now())`,
      [ID_SECCION_B, institucionId, ofertaId],
    );
  }

  // Curriculo
  const [areaExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM areas_curriculares WHERE id_institucion_educativa = $1 AND codigo_normalizado = 'MATEMATICA' LIMIT 1`,
    [institucionId],
  );
  const areaId = areaExistente ? areaExistente.id : ID_AREA;
  if (!areaExistente) {
    await manager.query(
      `INSERT INTO areas_curriculares
         (id, id_institucion_educativa, codigo, codigo_normalizado, nombre, nombre_normalizado, descripcion, orden, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, 'MATEMATICA', 'MATEMATICA', 'Matemática', 'MATEMATICA', 'Área de matemática', 1, 'ACTIVA', now(), now())`,
      [ID_AREA, institucionId],
    );
  }

  const [asignaturaExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM asignaturas WHERE id_area_curricular = $1 AND codigo_normalizado = 'ALGEBRA' LIMIT 1`,
    [areaId],
  );
  const asignaturaId = asignaturaExistente
    ? asignaturaExistente.id
    : ID_ASIGNATURA;
  if (!asignaturaExistente) {
    await manager.query(
      `INSERT INTO asignaturas
         (id, id_institucion_educativa, id_area_curricular, codigo, codigo_normalizado, nombre, nombre_corto, descripcion, orden, estado, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, 'ALGEBRA', 'ALGEBRA', 'Álgebra', 'Álgebra', 'Curso de álgebra', 1, 'ACTIVA', now(), now())`,
      [ID_ASIGNATURA, institucionId, areaId],
    );
  }

  const [planExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM planes_estudio WHERE id_institucion_educativa = $1 AND codigo_normalizado = 'PLAN-1ERO-MAT' LIMIT 1`,
    [institucionId],
  );
  const planId = planExistente ? planExistente.id : ID_PLAN;
  if (!planExistente) {
    await manager.query(
      `INSERT INTO planes_estudio
         (id, id_institucion_educativa, id_anio_academico, id_grado_educativo, codigo, codigo_normalizado, nombre, version, estado, observacion, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'PLAN-1ERO-MAT', 'PLAN-1ERO-MAT', 'Plan Primer Grado Matemática', 1, 'BORRADOR', 'Plan demo', now(), now())`,
      [ID_PLAN, institucionId, anioId, gradoId],
    );
  }

  const [detalleExistente] = await manager.query<{ id: string }[]>(
    `SELECT id FROM detalles_plan_estudio WHERE id_plan_estudio = $1 AND id_asignatura = $2 LIMIT 1`,
    [planId, asignaturaId],
  );
  if (!detalleExistente) {
    await manager.query(
      `INSERT INTO detalles_plan_estudio
         (id, id_institucion_educativa, id_plan_estudio, id_asignatura, tipo, horas_semanales, horas_anuales, orden, estado, observacion, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, 'OBLIGATORIA', 4, 160, 1, 'ACTIVO', 'Detalle demo', now(), now())`,
      [ID_PLAN_DETALLE, institucionId, planId, asignaturaId],
    );
  }
}

async function ejecutarDemo(): Promise<void> {
  const entorno = process.env.ENTORNO || process.env.NODE_ENV || 'development';

  if (!entornoPermiteSemillasDemo(entorno)) {
    throw new Error(
      `La semilla demo solo se ejecuta en entornos de desarrollo/test. ENTORNO/NODE_ENV=${entorno}`,
    );
  }

  if (!fuenteDatos.isInitialized) {
    await fuenteDatos.initialize();
  }

  const passwordSeed = process.env.DEMO_PASSWORD;
  if (!passwordSeed) {
    throw new Error(
      'La variable de entorno DEMO_PASSWORD debe estar configurada.',
    );
  }

  const hashClave = await argon2.hash(passwordSeed, {
    type: argon2.argon2id,
  });

  await fuenteDatos.transaction(async (manager) => {
    // 1. Institución principal demo
    const instId = await obtenerOInsertarInstitucion(
      manager,
      ID_INST_1,
      'DEMO',
      'Institución Demo',
    );

    // 2. Dos sedes
    const sedeId1 = await obtenerOInsertarSede(
      manager,
      ID_SEDE_1,
      instId,
      'DEMO-001',
      'Sede Principal Demo',
      true,
    );
    const sedeId2 = await obtenerOInsertarSede(
      manager,
      ID_SEDE_2,
      instId,
      'DEMO-002',
      'Sede Secundaria Demo',
      false,
    );

    // 3. Un director diferente para cada sede
    // Director Sede 1
    const pDir1 = await obtenerOInsertarPersona(
      manager,
      ID_DIR_1_PERSONA,
      instId,
      'Director Sede 1',
      'Perez',
      'Garcia',
    );
    const uDir1 = await obtenerOInsertarUsuario(
      manager,
      ID_DIR_1_USER,
      'director1@edura.local',
      'Dir Uno',
      hashClave,
    );
    const mDir1 = await obtenerOInsertarMembresia(
      manager,
      ID_DIR_1_MEMBRESIA,
      uDir1,
      instId,
      pDir1,
    );

    const [rolDir] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'DIRECTOR_SEDE' LIMIT 1`,
    );
    if (rolDir) {
      const [asigExist] = await manager.query<{ id: string }[]>(
        `SELECT id FROM asignaciones_rol_usuario WHERE id_usuario = $1 AND id_rol = $2 AND id_sede = $3 LIMIT 1`,
        [uDir1, rolDir.id, sedeId1],
      );
      if (!asigExist) {
        await manager.query(
          `INSERT INTO asignaciones_rol_usuario
             (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVA', CURRENT_DATE, now())`,
          [uDir1, rolDir.id, mDir1, sedeId1],
        );
      }
    }

    // Director Sede 2
    const pDir2 = await obtenerOInsertarPersona(
      manager,
      ID_DIR_2_PERSONA,
      instId,
      'Director Sede 2',
      'Rodriguez',
      'Flores',
    );
    const uDir2 = await obtenerOInsertarUsuario(
      manager,
      ID_DIR_2_USER,
      'director2@edura.local',
      'Dir Dos',
      hashClave,
    );
    const mDir2 = await obtenerOInsertarMembresia(
      manager,
      ID_DIR_2_MEMBRESIA,
      uDir2,
      instId,
      pDir2,
    );
    if (rolDir) {
      const [asigExist] = await manager.query<{ id: string }[]>(
        `SELECT id FROM asignaciones_rol_usuario WHERE id_usuario = $1 AND id_rol = $2 AND id_sede = $3 LIMIT 1`,
        [uDir2, rolDir.id, sedeId2],
      );
      if (!asigExist) {
        await manager.query(
          `INSERT INTO asignaciones_rol_usuario
             (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVA', CURRENT_DATE, now())`,
          [uDir2, rolDir.id, mDir2, sedeId2],
        );
      }
    }

    // 4. Administrador institucional
    const pAdmin = await obtenerOInsertarPersona(
      manager,
      ID_ADMIN_PERSONA,
      instId,
      'Admin Demo',
      'Lopez',
      'Soto',
    );
    const uAdmin = await obtenerOInsertarUsuario(
      manager,
      ID_ADMIN_USER,
      'admin.demo@institucion.local',
      'Admin Demo',
      hashClave,
    );
    const mAdmin = await obtenerOInsertarMembresia(
      manager,
      ID_ADMIN_MEMBRESIA,
      uAdmin,
      instId,
      pAdmin,
    );
    const [rolAdmin] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_INSTITUCION' LIMIT 1`,
    );
    if (rolAdmin) {
      const [asigExist] = await manager.query<{ id: string }[]>(
        `SELECT id FROM asignaciones_rol_usuario WHERE id_usuario = $1 AND id_rol = $2 AND id_sede IS NULL LIMIT 1`,
        [uAdmin, rolAdmin.id],
      );
      if (!asigExist) {
        await manager.query(
          `INSERT INTO asignaciones_rol_usuario
             (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
           VALUES (gen_random_uuid(), $1, $2, $3, NULL, 'ACTIVA', CURRENT_DATE, now())`,
          [uAdmin, rolAdmin.id, mAdmin],
        );
      }
    }

    // 5. Docente
    const pDoc = await obtenerOInsertarPersona(
      manager,
      ID_DOCENTE_PERSONA,
      instId,
      'Docente Demo',
      'Gomez',
      'Ruiz',
    );
    const uDoc = await obtenerOInsertarUsuario(
      manager,
      ID_DOCENTE_USER,
      'docente@edura.local',
      'Docente Demo',
      hashClave,
    );
    const mDoc = await obtenerOInsertarMembresia(
      manager,
      ID_DOCENTE_MEMBRESIA,
      uDoc,
      instId,
      pDoc,
    );
    const [rolDoc] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'DOCENTE' LIMIT 1`,
    );
    if (rolDoc) {
      const [asigExist] = await manager.query<{ id: string }[]>(
        `SELECT id FROM asignaciones_rol_usuario WHERE id_usuario = $1 AND id_rol = $2 AND id_sede = $3 LIMIT 1`,
        [uDoc, rolDoc.id, sedeId1],
      );
      if (!asigExist) {
        await manager.query(
          `INSERT INTO asignaciones_rol_usuario
             (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVA', CURRENT_DATE, now())`,
          [uDoc, rolDoc.id, mDoc, sedeId1],
        );
      }
    }

    const [docenteRegExist] = await manager.query<{ id: string }[]>(
      `SELECT id FROM docentes WHERE id_institucion_educativa = $1 AND codigo_normalizado = 'DOC-001' LIMIT 1`,
      [instId],
    );
    const docenteRegId = docenteRegExist ? docenteRegExist.id : ID_DOCENTE_REG;
    if (!docenteRegExist) {
      await manager.query(
        `INSERT INTO docentes
           (id, id_institucion_educativa, id_persona, codigo, codigo_normalizado, estado, fecha_ingreso, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, 'DOC-001', 'DOC-001', 'ACTIVO', CURRENT_DATE, now(), now())`,
        [ID_DOCENTE_REG, instId, pDoc],
      );
      await manager.query(
        `INSERT INTO asignaciones_docente_sede
           (id, id_institucion_educativa, id_docente, id_sede, es_principal, estado, fecha_inicio, fecha_creacion, fecha_modificacion)
         VALUES (gen_random_uuid(), $1, $2, $3, true, 'ACTIVA', CURRENT_DATE, now(), now())`,
        [instId, ID_DOCENTE_REG, sedeId1],
      );
    }

    // 6. Tres estudiantes
    const estudiantesData = [
      {
        idUser: ID_EST_1_USER,
        idPersona: ID_EST_1_PERSONA,
        idMemb: ID_EST_1_MEMBRESIA,
        idEst: ID_EST_1_REG,
        correo: 'estudiante1@edura.local',
        nombres: 'Ana',
        ap: 'Perez',
        code: 'EST-001',
      },
      {
        idUser: ID_EST_2_USER,
        idPersona: ID_EST_2_PERSONA,
        idMemb: ID_EST_2_MEMBRESIA,
        idEst: ID_EST_2_REG,
        correo: 'estudiante2@edura.local',
        nombres: 'Bruno',
        ap: 'Diaz',
        code: 'EST-002',
      },
      {
        idUser: ID_EST_3_USER,
        idPersona: ID_EST_3_PERSONA,
        idMemb: ID_EST_3_MEMBRESIA,
        idEst: ID_EST_3_REG,
        correo: 'estudiante3@edura.local',
        nombres: 'Camila',
        ap: 'Cruz',
        code: 'EST-003',
      },
    ];

    const [rolEst] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'ESTUDIANTE' LIMIT 1`,
    );

    const estRegIds: string[] = [];
    for (const est of estudiantesData) {
      const pEst = await obtenerOInsertarPersona(
        manager,
        est.idPersona,
        instId,
        est.nombres,
        est.ap,
        'Demo',
      );
      const uEst = await obtenerOInsertarUsuario(
        manager,
        est.idUser,
        est.correo,
        `${est.nombres} ${est.ap}`,
        hashClave,
      );
      const mEst = await obtenerOInsertarMembresia(
        manager,
        est.idMemb,
        uEst,
        instId,
        pEst,
      );
      if (rolEst) {
        const [asigExist] = await manager.query<{ id: string }[]>(
          `SELECT id FROM asignaciones_rol_usuario WHERE id_usuario = $1 AND id_rol = $2 LIMIT 1`,
          [uEst, rolEst.id],
        );
        if (!asigExist) {
          await manager.query(
            `INSERT INTO asignaciones_rol_usuario
               (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVA', CURRENT_DATE, now())`,
            [uEst, rolEst.id, mEst, sedeId1],
          );
        }
      }

      const [estExist] = await manager.query<{ id: string }[]>(
        `SELECT id FROM estudiantes WHERE id_institucion_educativa = $1 AND codigo = $2 LIMIT 1`,
        [instId, est.code],
      );
      const estRegId = estExist ? estExist.id : est.idEst;
      if (!estExist) {
        await manager.query(
          `INSERT INTO estudiantes
             (id, id_institucion_educativa, id_sede, id_persona, codigo, estado, fecha_ingreso, fecha_creacion, fecha_modificacion)
           VALUES ($1, $2, $3, $4, $5, 'ACTIVO', CURRENT_DATE, now(), now())`,
          [est.idEst, instId, sedeId1, pEst, est.code],
        );
      }
      estRegIds.push(estRegId);
    }

    // 7. Apoderado
    const pApod = await obtenerOInsertarPersona(
      manager,
      ID_APODERADO_PERSONA,
      instId,
      'Apoderado Demo',
      'Fernandez',
      'Vega',
    );
    const uApod = await obtenerOInsertarUsuario(
      manager,
      ID_APODERADO_USER,
      'apoderado@edura.local',
      'Apoderado Demo',
      hashClave,
    );
    const mApod = await obtenerOInsertarMembresia(
      manager,
      ID_APODERADO_MEMBRESIA,
      uApod,
      instId,
      pApod,
    );
    const [rolApod] = await manager.query<{ id: string }[]>(
      `SELECT id FROM roles WHERE codigo = 'APODERADO' LIMIT 1`,
    );
    if (rolApod) {
      const [asigExist] = await manager.query<{ id: string }[]>(
        `SELECT id FROM asignaciones_rol_usuario WHERE id_usuario = $1 AND id_rol = $2 LIMIT 1`,
        [uApod, rolApod.id],
      );
      if (!asigExist) {
        await manager.query(
          `INSERT INTO asignaciones_rol_usuario
             (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
           VALUES (gen_random_uuid(), $1, $2, $3, NULL, 'ACTIVA', CURRENT_DATE, now())`,
          [uApod, rolApod.id, mApod],
        );
      }
    }
    // Relación
    const [relExist] = await manager.query<{ id: string }[]>(
      `SELECT id FROM apoderados_estudiante WHERE id_estudiante = $1 LIMIT 1`,
      [estRegIds[0]],
    );
    if (!relExist) {
      await manager.query(
        `INSERT INTO apoderados_estudiante
           (id, id_institucion_educativa, id_estudiante, id_persona, parentesco, es_principal, puede_recoger, recibe_comunicaciones, estado, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, $3, $4, 'MADRE', true, true, true, 'ACTIVO', now(), now())`,
        [ID_APODERADO_REL, instId, estRegIds[0], pApod],
      );
    }

    // 8. Un usuario con más de un contexto para probar el selector
    if (rolDir) {
      const [asigExist2] = await manager.query<{ id: string }[]>(
        `SELECT id FROM asignaciones_rol_usuario WHERE id_usuario = $1 AND id_rol = $2 AND id_sede = $3 LIMIT 1`,
        [uDir1, rolDir.id, sedeId2],
      );
      if (!asigExist2) {
        await manager.query(
          `INSERT INTO asignaciones_rol_usuario
             (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVA', CURRENT_DATE, now())`,
          [uDir1, rolDir.id, mDir1, sedeId2],
        );
      }
    }

    // 9. Segundo tenant mínimo
    const instId2 = await obtenerOInsertarInstitucion(
      manager,
      ID_INST_2,
      'TENANT2',
      'Tenant Dos S.A.',
    );
    await obtenerOInsertarSede(
      manager,
      ID_SEDE_T2,
      instId2,
      'T2-001',
      'Sede Principal Tenant 2',
      true,
    );
    const pAdminT2 = await obtenerOInsertarPersona(
      manager,
      ID_ADMIN_T2_PERSONA,
      instId2,
      'Admin Tenant2',
      'Soto',
      'Gomez',
    );
    const uAdminT2 = await obtenerOInsertarUsuario(
      manager,
      ID_ADMIN_T2_USER,
      'admin@tenant2.local',
      'Admin Tenant2',
      hashClave,
    );
    const mAdminT2 = await obtenerOInsertarMembresia(
      manager,
      ID_ADMIN_T2_MEMBRESIA,
      uAdminT2,
      instId2,
      pAdminT2,
    );
    if (rolAdmin) {
      const [asigExist] = await manager.query<{ id: string }[]>(
        `SELECT id FROM asignaciones_rol_usuario WHERE id_usuario = $1 AND id_rol = $2 LIMIT 1`,
        [uAdminT2, rolAdmin.id],
      );
      if (!asigExist) {
        await manager.query(
          `INSERT INTO asignaciones_rol_usuario
             (id, id_usuario, id_rol, id_membresia_institucion, id_sede, estado, fecha_inicio, fecha_creacion)
           VALUES (gen_random_uuid(), $1, $2, $3, NULL, 'ACTIVA', CURRENT_DATE, now())`,
          [uAdminT2, rolAdmin.id, mAdminT2],
        );
      }
    }

    // Sembrar Estructura Académica para la institución principal
    await sembrarEstructuraAcademica(manager, instId, sedeId1);

    // Obtener los ids reales de los grados, periodos y ofertas/secciones
    const [nivelRow] = await manager.query<{ id: string }[]>(
      `SELECT id FROM niveles_educativos WHERE id_institucion_educativa = $1 LIMIT 1`,
      [instId],
    );
    const [gradoRow] = await manager.query<{ id: string }[]>(
      `SELECT id FROM grados_educativos WHERE id_institucion_educativa = $1 LIMIT 1`,
      [instId],
    );
    const [anioRow] = await manager.query<{ id: string }[]>(
      `SELECT id FROM anios_academicos WHERE id_institucion_educativa = $1 LIMIT 1`,
      [instId],
    );
    const [ofertaRow] = await manager.query<{ id: string }[]>(
      `SELECT id FROM ofertas_grado_sede WHERE id_institucion_educativa = $1 LIMIT 1`,
      [instId],
    );
    const [seccionARow] = await manager.query<{ id: string }[]>(
      `SELECT id FROM secciones_academicas WHERE id_oferta_grado_sede = $1 AND codigo_normalizado = 'A' LIMIT 1`,
      [ofertaRow.id],
    );
    const [seccionBRow] = await manager.query<{ id: string }[]>(
      `SELECT id FROM secciones_academicas WHERE id_oferta_grado_sede = $1 AND codigo_normalizado = 'B' LIMIT 1`,
      [ofertaRow.id],
    );

    // 10. Matrícula activa en sección A (con vacantes)
    const [mat1Exist] = await manager.query<{ id: string }[]>(
      `SELECT id FROM matriculas WHERE id_estudiante = $1 LIMIT 1`,
      [estRegIds[0]],
    );
    if (!mat1Exist) {
      await manager.query(
        `INSERT INTO matriculas (
          id, id_institucion_educativa, id_sede, id_estudiante, id_anio_academico,
          id_nivel_educativo, id_grado_educativo, id_oferta_grado_sede, id_seccion_academica,
          codigo_matricula, fecha_matricula, estado, observacion, id_usuario_creador,
          id_usuario_activador, fecha_activacion, fecha_creacion, fecha_modificacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 'MAT-DEMO-001', CURRENT_DATE, 'ACTIVA', 'Matrícula activa en Sección A', $10, $10, now(), now(), now()
        )`,
        [
          ID_MATRICULA_1,
          instId,
          sedeId1,
          estRegIds[0],
          anioRow.id,
          nivelRow.id,
          gradoRow.id,
          ofertaRow.id,
          seccionARow.id,
          uAdmin,
        ],
      );
    }

    // 11. Matrícula en borrador
    const [mat2Exist] = await manager.query<{ id: string }[]>(
      `SELECT id FROM matriculas WHERE id_estudiante = $1 LIMIT 1`,
      [estRegIds[1]],
    );
    if (!mat2Exist) {
      await manager.query(
        `INSERT INTO matriculas (
          id, id_institucion_educativa, id_sede, id_estudiante, id_anio_academico,
          id_nivel_educativo, id_grado_educativo, id_oferta_grado_sede, id_seccion_academica,
          codigo_matricula, fecha_matricula, estado, observacion, id_usuario_creador,
          fecha_creacion, fecha_modificacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NULL, 'MAT-DEMO-002', CURRENT_DATE, 'BORRADOR', 'Matrícula en borrador', $9, now(), now()
        )`,
        [
          ID_MATRICULA_2,
          instId,
          sedeId1,
          estRegIds[1],
          anioRow.id,
          nivelRow.id,
          gradoRow.id,
          ofertaRow.id,
          uAdmin,
        ],
      );
    }

    // 13. Sección realmente llena (Sección B tiene capacidad 1)
    const [mat3Exist] = await manager.query<{ id: string }[]>(
      `SELECT id FROM matriculas WHERE id_estudiante = $1 LIMIT 1`,
      [estRegIds[2]],
    );
    if (!mat3Exist) {
      await manager.query(
        `INSERT INTO matriculas (
          id, id_institucion_educativa, id_sede, id_estudiante, id_anio_academico,
          id_nivel_educativo, id_grado_educativo, id_oferta_grado_sede, id_seccion_academica,
          codigo_matricula, fecha_matricula, estado, observacion, id_usuario_creador,
          id_usuario_activador, fecha_activacion, fecha_creacion, fecha_modificacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 'MAT-DEMO-003', CURRENT_DATE, 'ACTIVA', 'Matrícula activa en Sección B (Llena)', $10, $10, now(), now(), now()
        )`,
        [
          ID_MATRICULA_3,
          instId,
          sedeId1,
          estRegIds[2],
          anioRow.id,
          nivelRow.id,
          gradoRow.id,
          ofertaRow.id,
          seccionBRow.id,
          uAdmin,
        ],
      );
    }

    // Sembrar identidad visual demo
    const [identidadExist] = await manager.query<{ id: string }[]>(
      `SELECT id FROM identidades_visuales_institucion WHERE id_institucion_educativa = $1 LIMIT 1`,
      [instId],
    );
    const identidadId = identidadExist ? identidadExist.id : 'd3b07384-d113-43cf-a52d-000000000301';
    if (!identidadExist) {
      await manager.query(
        `INSERT INTO identidades_visuales_institucion (id, id_institucion_educativa, id_version_publicada, estado, fecha_creacion, fecha_modificacion)
         VALUES ($1, $2, NULL, 'ACTIVA', now(), now())`,
        [identidadId, instId],
      );
    }

    const [versionExist] = await manager.query<{ id: string }[]>(
      `SELECT id FROM versiones_identidad_visual WHERE id_identidad_visual = $1 AND numero_version = 1 LIMIT 1`,
      [identidadId],
    );
    const versionId = versionExist ? versionExist.id : 'd3b07384-d113-43cf-a52d-000000000302';
    if (!versionExist) {
      await manager.query(
        `INSERT INTO versiones_identidad_visual (
          id, id_identidad_visual, numero_version, estado, nombre_marca, nombre_corto_visual, lema,
          titulo_login, mensaje_login, texto_pie_login, color_primario, color_sobre_primario,
          color_secundario, color_acento, color_fondo, color_superficie, color_texto_principal,
          color_texto_secundario, variante_login, id_usuario_creador, id_usuario_publicador,
          fecha_publicacion, fecha_creacion, fecha_modificacion
        ) VALUES (
          $1, $2, 1, 'PUBLICADA', 'Colegio San Martín', 'San Martín', 'Educamos para el futuro',
          'Acceso Institucional', 'Ingresa a la plataforma educativa.', 'Tecnología provista por EDURA',
          '#1E3A8A', '#FFFFFF', '#D8A72D', '#3B82F6', '#F8FAFC', '#FFFFFF', '#172033', '#536078',
          'CENTRAL', $3, $3, now(), now(), now()
        )`,
        [versionId, identidadId, uAdmin],
      );

      await manager.query(
        `UPDATE identidades_visuales_institucion SET id_version_publicada = $1 WHERE id = $2`,
        [versionId, identidadId],
      );
    }

    // Sembrar puntos de acceso demo
    const [puntoSlugExist] = await manager.query<{ id: string }[]>(
      `SELECT id FROM puntos_acceso_institucion WHERE id_institucion_educativa = $1 AND tipo = 'RUTA_SLUG' LIMIT 1`,
      [instId],
    );
    if (!puntoSlugExist) {
      await manager.query(
        `INSERT INTO puntos_acceso_institucion (
          id, id_institucion_educativa, tipo, valor, valor_normalizado, es_principal, estado, fecha_creacion, fecha_modificacion
        ) VALUES (
          gen_random_uuid(), $1, 'RUTA_SLUG', 'demo', 'demo', true, 'ACTIVO', now(), now()
        )`,
        [instId],
      );
    }

    const [puntoSubExist] = await manager.query<{ id: string }[]>(
      `SELECT id FROM puntos_acceso_institucion WHERE id_institucion_educativa = $1 AND tipo = 'SUBDOMINIO_EDURA' LIMIT 1`,
      [instId],
    );
    if (!puntoSubExist) {
      await manager.query(
        `INSERT INTO puntos_acceso_institucion (
          id, id_institucion_educativa, tipo, valor, valor_normalizado, es_principal, estado, fecha_creacion, fecha_modificacion
        ) VALUES (
          gen_random_uuid(), $1, 'SUBDOMINIO_EDURA', 'demo', 'demo', false, 'ACTIVO', now(), now()
        )`,
        [instId],
      );
    }

    console.log(
      'Semilla demo aplicada de manera determinista e idempotente sin duplicados.',
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
