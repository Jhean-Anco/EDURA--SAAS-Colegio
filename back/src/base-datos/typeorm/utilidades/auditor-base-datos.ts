import * as fs from 'node:fs';
import * as path from 'node:path';
import fuenteDatos from '../fuente-datos';

interface Inconsistencia {
  tipo: string;
  descripcion: string;
  detalles: any;
  critico: boolean;
}

async function auditar(): Promise<void> {
  if (!fuenteDatos.isInitialized) {
    await fuenteDatos.initialize();
  }

  const inconsistencias: Inconsistencia[] = [];
  const reporte: any = {
    fecha: new Date().toISOString(),
    migraciones: {},
    tablas: {},
    conteos: {},
    inconsistencias: [],
  };

  // 1. Migraciones
  try {
    const migraciones = await fuenteDatos.query(`SELECT * FROM migraciones_aplicadas ORDER BY id ASC`);
    reporte.migraciones = {
      aplicadasCount: migraciones.length,
      detalle: migraciones.map((m: any) => ({ id: m.id, nombre: m.name })),
    };
  } catch (e: any) {
    inconsistencias.push({
      tipo: 'MIGRACIONES_ERROR',
      descripcion: 'Error al consultar tabla de migraciones',
      detalles: e.message,
      critico: true,
    });
  }

  // 2. Tablas existentes y conteos
  const tablasFuncionales = [
    'instituciones_educativas', 'sedes', 'predios', 'edificaciones', 'niveles',
    'espacios_fisicos', 'espacios_exteriores', 'componentes_infraestructura',
    'elementos_infraestructura', 'evaluaciones_conservacion_elemento',
    'usuarios', 'credenciales_usuario', 'membresias_institucion',
    'roles', 'permisos', 'roles_permisos', 'asignaciones_rol_usuario',
    'invitaciones_acceso', 'sesiones_usuario', 'tokens_seguridad_usuario',
    'eventos_auditoria', 'personas', 'documentos_identidad_persona',
    'medios_contacto_persona', 'direcciones_persona', 'estudiantes',
    'apoderados_estudiante', 'documentos_estudiante', 'docentes',
    'asignaciones_docente_sede', 'especialidades_profesionales',
    'docentes_especialidades_profesionales', 'anios_academicos',
    'periodos_academicos', 'ofertas_grado_sede', 'secciones_academicas',
    'areas_curriculares', 'asignaturas', 'planes_estudio',
    'detalles_plan_estudio', 'matriculas', 'historial_estados_matricula',
    'historial_cambios_seccion_matricula', 'comunicados_institucionales',
    'alertas_institucionales'
  ];

  for (const tabla of tablasFuncionales) {
    try {
      const [{ count }] = await fuenteDatos.query(`SELECT count(*)::int as count FROM ${tabla}`);
      reporte.conteos[tabla] = count;
    } catch (e: any) {
      reporte.conteos[tabla] = -1;
      inconsistencias.push({
        tipo: 'TABLA_INEXISTENTE_O_ERROR',
        descripcion: `Error al contar registros en tabla ${tabla}`,
        detalles: e.message,
        critico: false,
      });
    }
  }

  // 3. Validaciones de Integridad / Inconsistencias
  const queryValidaciones = [
    {
      tipo: 'USUARIO_SIN_CREDENCIAL',
      sql: `SELECT id, correo FROM usuarios WHERE id NOT IN (SELECT id_usuario FROM credenciales_usuario)`,
      descripcion: 'Usuarios sin credencial registrada',
      critico: true
    },
    {
      tipo: 'CREDENCIAL_SIN_USUARIO',
      sql: `SELECT id_usuario FROM credenciales_usuario WHERE id_usuario NOT IN (SELECT id FROM usuarios)`,
      descripcion: 'Credenciales huérfanas sin usuario',
      critico: true
    },
    {
      tipo: 'MEMBRESIA_SIN_PERSONA',
      sql: `SELECT m.id, m.id_usuario 
            FROM membresias_institucion m 
            JOIN asignaciones_rol_usuario a ON a.id_membresia_institucion = m.id 
            JOIN roles r ON a.id_rol = r.id 
            WHERE m.id_persona IS NULL AND r.codigo != 'PROPIETARIO_PLATAFORMA'`,
      descripcion: 'Membresías institucionales que no tienen persona asignada',
      critico: false
    },
    {
      tipo: 'ASIGNACION_SIN_MEMBRESIA',
      sql: `SELECT a.id, a.id_usuario, r.codigo 
            FROM asignaciones_rol_usuario a 
            JOIN roles r ON a.id_rol = r.id 
            WHERE a.id_membresia_institucion IS NULL AND r.codigo != 'PROPIETARIO_PLATAFORMA'`,
      descripcion: 'Asignaciones de rol no vinculadas a membresía (excepto propietario)',
      critico: true
    },
    {
      tipo: 'ROL_SEDE_SIN_SEDE',
      sql: `SELECT a.id, a.id_usuario, r.codigo 
            FROM asignaciones_rol_usuario a 
            JOIN roles r ON a.id_rol = r.id 
            WHERE r.ambito = 'SEDE' AND a.id_sede IS NULL`,
      descripcion: 'Asignaciones con ámbito SEDE que no especifican sedeId',
      critico: true
    },
    {
      tipo: 'ROL_INSTITUCION_CON_SEDE',
      sql: `SELECT a.id, a.id_usuario, r.codigo 
            FROM asignaciones_rol_usuario a 
            JOIN roles r ON a.id_rol = r.id 
            WHERE r.ambito = 'INSTITUCION' AND a.id_sede IS NOT NULL`,
      descripcion: 'Asignaciones con ámbito INSTITUCION que tienen sedeId asignado',
      critico: true
    },
    {
      tipo: 'DOCENTE_SIN_USUARIO',
      sql: `SELECT d.id, d.codigo 
            FROM docentes d 
            LEFT JOIN personas p ON d.id_persona = p.id 
            LEFT JOIN membresias_institucion m ON m.id_persona = p.id 
            WHERE m.id_usuario IS NULL`,
      descripcion: 'Docentes que no tienen un usuario asociado a su persona',
      critico: false
    },
    {
      tipo: 'USUARIO_DOCENTE_SIN_DOCENTE',
      sql: `SELECT a.id, a.id_usuario 
            FROM asignaciones_rol_usuario a 
            JOIN roles r ON a.id_rol = r.id 
            JOIN membresias_institucion m ON a.id_membresia_institucion = m.id 
            LEFT JOIN docentes d ON d.id_persona = m.id_persona 
            WHERE r.codigo = 'DOCENTE' AND d.id IS NULL`,
      descripcion: 'Usuarios con rol DOCENTE que no tienen registro docente',
      critico: true
    },
    {
      tipo: 'ESTUDIANTE_SIN_USUARIO_PRUEBA',
      sql: `SELECT e.id, e.codigo 
            FROM estudiantes e 
            LEFT JOIN personas p ON e.id_persona = p.id 
            LEFT JOIN membresias_institucion m ON m.id_persona = p.id 
            WHERE m.id_usuario IS NULL`,
      descripcion: 'Estudiantes de prueba que no tienen usuario asociado',
      critico: false
    },
    {
      tipo: 'USUARIO_ESTUDIANTE_SIN_PROPIEDAD',
      sql: `SELECT a.id, a.id_usuario 
            FROM asignaciones_rol_usuario a 
            JOIN roles r ON a.id_rol = r.id 
            JOIN membresias_institucion m ON a.id_membresia_institucion = m.id 
            LEFT JOIN estudiantes e ON e.id_persona = m.id_persona 
            WHERE r.codigo = 'ESTUDIANTE' AND e.id IS NULL`,
      descripcion: 'Usuarios con rol ESTUDIANTE sin registro estudiante',
      critico: true
    },
    {
      tipo: 'APODERADO_SIN_USUARIO',
      sql: `SELECT ae.id, p.nombres 
            FROM apoderados_estudiante ae 
            LEFT JOIN personas p ON ae.id_persona = p.id 
            LEFT JOIN membresias_institucion m ON m.id_persona = p.id 
            WHERE m.id_usuario IS NULL`,
      descripcion: 'Apoderados sin usuario asociado',
      critico: false
    },
    {
      tipo: 'USUARIO_APODERADO_SIN_ESTUDIANTES',
      sql: `SELECT a.id, a.id_usuario 
            FROM asignaciones_rol_usuario a 
            JOIN roles r ON a.id_rol = r.id 
            JOIN membresias_institucion m ON a.id_membresia_institucion = m.id 
            LEFT JOIN apoderados_estudiante ae ON ae.id_persona = m.id_persona 
            WHERE r.codigo = 'APODERADO' AND ae.id IS NULL`,
      descripcion: 'Usuarios con rol APODERADO que no están vinculados a ningún estudiante',
      critico: true
    },
    {
      tipo: 'PERSONAS_DUPLICADAS',
      sql: `SELECT nombres, apellido_paterno, apellido_materno, count(*) 
            FROM personas 
            GROUP BY nombres, apellido_paterno, apellido_materno 
            HAVING count(*) > 1`,
      descripcion: 'Personas con nombres y apellidos idénticos',
      critico: false
    },
    {
      tipo: 'CORREOS_DUPLICADOS',
      sql: `SELECT correo_normalizado, count(*) 
            FROM usuarios 
            GROUP BY correo_normalizado 
            HAVING count(*) > 1`,
      descripcion: 'Usuarios con correo electrónico duplicado',
      critico: true
    },
    {
      tipo: 'CODIGOS_DUPLICADOS',
      sql: `SELECT codigo, count(*) 
            FROM estudiantes 
            GROUP BY codigo 
            HAVING count(*) > 1`,
      descripcion: 'Estudiantes con código duplicado',
      critico: true
    },
    {
      tipo: 'SESIONES_HUERFANAS',
      sql: `SELECT id FROM sesiones_usuario WHERE id_usuario NOT IN (SELECT id FROM usuarios)`,
      descripcion: 'Sesiones asignadas a usuarios inexistentes',
      critico: true
    },
    {
      tipo: 'HISTORIAL_MATRICULA_DUPLICADO',
      sql: `SELECT id_matricula, estado_nuevo, fecha, count(*) 
            FROM historial_estados_matricula 
            GROUP BY id_matricula, estado_nuevo, fecha 
            HAVING count(*) > 1`,
      descripcion: 'Cambios de estado de matrícula idénticos en la misma fecha',
      critico: false
    },
    {
      // Aislamiento multi-institución
      tipo: 'ESTUDIANTE_TENANT_INCONSISTENTE',
      sql: `SELECT e.id, e.codigo 
            FROM estudiantes e 
            JOIN personas p ON e.id_persona = p.id 
            WHERE e.id_institucion_educativa != p.id_institucion_educativa`,
      descripcion: 'Estudiantes con institución diferente a su persona vinculada',
      critico: true
    },
    {
      tipo: 'DOCENTE_TENANT_INCONSISTENTE',
      sql: `SELECT d.id, d.codigo 
            FROM docentes d 
            JOIN personas p ON d.id_persona = p.id 
            WHERE d.id_institucion_educativa != p.id_institucion_educativa`,
      descripcion: 'Docentes con institución diferente a su persona vinculada',
      critico: true
    },
    {
      tipo: 'MATRICULA_TENANT_INCONSISTENTE',
      sql: `SELECT m.id, m.codigo_matricula 
            FROM matriculas m 
            JOIN estudiantes e ON m.id_estudiante = e.id 
            WHERE m.id_institucion_educativa != e.id_institucion_educativa`,
      descripcion: 'Matrículas con institución diferente a la del estudiante',
      critico: true
    }
  ];

  for (const val of queryValidaciones) {
    try {
      const res = await fuenteDatos.query(val.sql);
      if (res.length > 0) {
        inconsistencias.push({
          tipo: val.tipo,
          descripcion: val.descripcion,
          detalles: res,
          critico: val.critico,
        });
      }
    } catch (e: any) {
      inconsistencias.push({
        tipo: `${val.tipo}_ERROR`,
        descripcion: `Error al ejecutar validación ${val.tipo}`,
        detalles: e.message,
        critico: val.critico,
      });
    }
  }

  reporte.inconsistencias = inconsistencias;

  // Escribir reportes
  const dirReportes = path.join(__dirname, '../../../../documentacion/auditorias');
  if (!fs.existsSync(dirReportes)) {
    fs.mkdirSync(dirReportes, { recursive: true });
  }

  const jsonPath = path.join(dirReportes, 'reporte-auditoria.json');
  fs.writeFileSync(jsonPath, JSON.stringify(reporte, null, 2));

  // Generar informe legible en Markdown
  const markdownPath = path.join(dirReportes, 'informe-auditoria.md');
  const errorCritico = inconsistencias.some(inc => inc.critico);

  let mdContent = `# Informe de Auditoría de Base de Datos Real - EDURA\n\n`;
  mdContent += `* **Fecha de Ejecución:** ${reporte.fecha}\n`;
  mdContent += `* **Migraciones Aplicadas:** ${reporte.migraciones?.aplicadasCount ?? 0}\n`;
  mdContent += `* **Inconsistencias Totales:** ${inconsistencias.length}\n`;
  mdContent += `* **Inconsistencias Críticas:** ${inconsistencias.filter(i => i.critico).length}\n`;
  mdContent += `* **Estado General:** ${errorCritico ? '🔴 CRÍTICO / INCONSISTENTE' : '🟢 SALUDABLE / COMPATIBLE'}\n\n`;

  mdContent += `## Conteo de Registros por Tabla\n\n| Tabla | Registros |\n| --- | --- |\n`;
  for (const [t, c] of Object.entries(reporte.conteos)) {
    mdContent += `| ${t} | ${c} |\n`;
  }
  mdContent += `\n`;

  if (inconsistencias.length > 0) {
    mdContent += `## Detalle de Inconsistencias Encontradas\n\n`;
    for (const inc of inconsistencias) {
      mdContent += `### [${inc.critico ? 'CRÍTICO' : 'ADVERTENCIA'}] ${inc.tipo}\n`;
      mdContent += `* **Descripción:** ${inc.descripcion}\n`;
      mdContent += `* **Detalles:**\n\`\`\`json\n${JSON.stringify(inc.detalles, null, 2)}\n\`\`\`\n\n`;
    }
  } else {
    mdContent += `*No se encontraron inconsistencias en la base de datos.*\n`;
  }

  fs.writeFileSync(markdownPath, mdContent);

  console.log(`Auditoría finalizada.`);
  console.log(`Informe Markdown: ${markdownPath}`);
  console.log(`Reporte estructurado JSON: ${jsonPath}`);

  if (errorCritico) {
    console.error(`Inconsistencias críticas encontradas.`);
    process.exit(1);
  } else {
    process.exit(0);
  }
}

auditar().catch((err) => {
  console.error('Fallo en la ejecución del auditor:', err);
  process.exit(1);
});
