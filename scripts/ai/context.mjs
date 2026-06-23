#!/usr/bin/env node
/**
 * Compilador de contexto por tarea EDURA.
 * Uso: node scripts/ai/context.mjs EDURA-XXX
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const idTarea = process.argv[2];

if (!idTarea) {
  console.error('Uso: pnpm ai:context -- EDURA-XXX');
  process.exit(1);
}

const rutaTarea = join(ROOT, 'tasks/active', `${idTarea}.md`);
if (!existsSync(rutaTarea)) {
  console.error(`Tarea no encontrada: tasks/active/${idTarea}.md`);
  console.error('Crea la tarea con la plantilla en tasks/templates/TASK.template.md');
  process.exit(1);
}

const contenidoTarea = readFileSync(rutaTarea, 'utf8');

// Extraer módulos mencionados
const modulosEdura = [
  'curriculo', 'docentes', 'estudiantes', 'matriculas', 'identidad-acceso',
  'estructura-academica', 'estructura-institucional', 'personas',
  'panel-institucional', 'infraestructura-fisica', 'integraciones-externas'
];
const modulosAfectados = modulosEdura.filter(m => contenidoTarea.toLowerCase().includes(m));

// Determinar tipo
let tipo = 'normal';
if (contenidoTarea.match(/\b(seguridad|critico|crítico|migracion|migración|multitenencia)\b/i)) {
  tipo = 'critico';
} else if (contenidoTarea.match(/\b(mecanico|mecánico|typo|renombrar|mover)\b/i)) {
  tipo = 'mecanico';
}

// Determinar perfil
let perfil = 'local-fast';
if (modulosAfectados.length > 0 && contenidoTarea.match(/frontend|next|react/i)) {
  perfil = 'frontend-ui';
} else if (modulosAfectados.length > 0) {
  perfil = 'backend';
}
if (contenidoTarea.match(/seguridad|auditoria|auditoría/i)) perfil = 'security-audit';
if (contenidoTarea.match(/base de datos|migracion|migración/i)) perfil = 'database-review';

// Obtener diff actual
let archivosModificados = [];
try {
  archivosModificados = execSync('git diff --name-only HEAD', { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(f => f.trim());
} catch { /* sin cambios */ }

// Construir rutas permitidas
const rutasPermitidas = [
  'AGENTS.md',
  'docs/ai/',
  `tasks/active/${idTarea}.md`,
  ...modulosAfectados.map(m => `back/src/modulos/${m}/`),
];

if (contenidoTarea.match(/frontend|next|react/i)) {
  rutasPermitidas.push('front/src/');
}

// Buscar ADR aplicables
const decisionesDir = join(ROOT, 'docs/ai/decisions');
let adrAplicables = [];
if (existsSync(decisionesDir)) {
  const { readdirSync } = await import('node:fs');
  adrAplicables = readdirSync(decisionesDir).filter(f => f.endsWith('.md'));
}

// Determinar presupuesto
const presupuesto = tipo;

// Generar cápsula
const capsula = {
  tarea: idTarea,
  generado: new Date().toISOString().slice(0, 10),
  tipo,
  perfil,
  objetivo: contenidoTarea.match(/objetivo[:\s]+(.+)/i)?.[1]?.trim() ?? 'Ver tarea',
  modulos_afectados: modulosAfectados,
  rutas_permitidas: rutasPermitidas,
  rutas_prohibidas: ['node_modules/', 'dist/', '.next/', 'coverage/', '.env'],
  archivos_modificados_actuales: archivosModificados,
  adr: adrAplicables,
  skills_sugeridas: obtenerSkillsSugeridas(contenidoTarea, modulosAfectados),
  mcp_perfil: perfil,
  presupuesto,
};

function obtenerSkillsSugeridas(contenido, modulos) {
  const skills = ['compilar-contexto-tarea'];
  if (modulos.length > 0) skills.push('crear-recurso-nestjs');
  if (contenido.match(/migracion|migración|entidad|columna/i)) skills.push('crear-migracion-typeorm');
  if (contenido.match(/frontend|next|react|pagina|página/i)) skills.push('crear-funcionalidad-nextjs');
  if (contenido.match(/seguridad|guard|auth/i)) skills.push('auditar-seguridad', 'revisar-autorizacion');
  skills.push('ejecutar-pruebas-dirigidas', 'cerrar-tarea-edura');
  return [...new Set(skills)];
}

// Escribir
const dirContexto = join(ROOT, 'tasks/context');
mkdirSync(dirContexto, { recursive: true });
const rutaSalida = join(dirContexto, `${idTarea}.context.yaml`);

const yaml = Object.entries(capsula)
  .map(([k, v]) => {
    if (Array.isArray(v)) {
      return `${k}:\n${v.map(i => `  - ${i}`).join('\n')}`;
    }
    return `${k}: ${v}`;
  })
  .join('\n');

writeFileSync(rutaSalida, `# Cápsula de contexto — ${idTarea}\n# Generado: ${capsula.generado}\n\n${yaml}\n`);

console.log(`✓ Cápsula generada: tasks/context/${idTarea}.context.yaml`);
console.log(`  Tipo: ${tipo} | Perfil: ${perfil} | Módulos: ${modulosAfectados.join(', ') || 'ninguno'}`);
console.log(`  Skills sugeridas: ${capsula.skills_sugeridas.join(', ')}`);
