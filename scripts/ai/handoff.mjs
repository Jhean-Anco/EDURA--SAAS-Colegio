#!/usr/bin/env node
/**
 * Generador de handoff compacto para tareas EDURA.
 * Uso: node scripts/ai/handoff.mjs EDURA-XXX [--estado implementado|parcial|bloqueado]
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const idTarea = process.argv[2];
const estadoIdx = process.argv.indexOf('--estado');
const estado = estadoIdx >= 0 ? process.argv[estadoIdx + 1] : 'implementado';

if (!idTarea) {
  console.error('Uso: pnpm ai:handoff -- EDURA-XXX [--estado implementado|parcial|bloqueado]');
  process.exit(1);
}

const rutaTarea = join(ROOT, 'tasks/active', `${idTarea}.md`);
const rutaHandoffsDir = join(ROOT, 'tasks/handoffs');
const rutaCompletadosDir = join(ROOT, 'tasks/completed');

mkdirSync(rutaHandoffsDir, { recursive: true });
mkdirSync(rutaCompletadosDir, { recursive: true });

// Obtener diff
let diffStat = '';
let archivosModificados = [];
try {
  diffStat = execSync('git diff main...HEAD --stat 2>/dev/null || git diff HEAD --stat', { cwd: ROOT, encoding: 'utf8' });
  archivosModificados = execSync('git diff --name-only HEAD', { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(f => f.trim())
    .map(f => {
      try {
        const stat = execSync(`git diff HEAD --shortstat -- "${f}"`, { cwd: ROOT, encoding: 'utf8' });
        return `${f} (${stat.trim()})`;
      } catch { return f; }
    });
} catch { /* sin diff */ }

const handoff = {
  tarea: idTarea,
  fecha: new Date().toISOString().slice(0, 10),
  estado,
  archivosModificados,
  decisiones: [],
  validaciones: {
    typecheck: 'pendiente',
    lint: 'pendiente',
    pruebas: 'pendiente',
    seguridad: 'pendiente',
  },
  riesgos: [],
  pendientes: estado !== 'implementado' ? ['Ver tarea para detalles de pendientes'] : [],
  metricas: {
    archivos_modificados: archivosModificados.length,
    duracion_minutos: 0,
    nota: 'Completar manualmente si se tienen datos de duración',
  },
};

const rutaHandoff = join(rutaHandoffsDir, `${idTarea}.handoff.json`);
writeFileSync(rutaHandoff, JSON.stringify(handoff, null, 2));
console.log(`✓ Handoff generado: tasks/handoffs/${idTarea}.handoff.json`);

// Mover a completed si está implementado
if (estado === 'implementado' && existsSync(rutaTarea)) {
  const rutaCompletada = join(rutaCompletadosDir, `${idTarea}.md`);
  renameSync(rutaTarea, rutaCompletada);
  console.log(`✓ Tarea movida a: tasks/completed/${idTarea}.md`);
}

console.log('\nEditar el handoff para agregar:');
console.log('  - decisiones tomadas');
console.log('  - resultado real de validaciones');
console.log('  - riesgos identificados');
console.log('  - pendientes no bloqueantes');
