#!/usr/bin/env node
/**
 * Bootstrap de la plataforma de agentes EDURA.
 * Verifica que la estructura requerida exista y está en buen estado.
 */
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');

const requeridos = [
  'AGENTS.md',
  'CLAUDE.md',
  '.ai/budgets.yaml',
  '.ai/skills.catalog.yaml',
  '.ai/skills.lock.yaml',
  '.ai/mcp.registry.yaml',
  '.ai/security-policy.yaml',
  'agent-assets/skills/',
  '.claude/rules/',
  '.claude/skills/',
  '.agents/skills/',
  'tasks/active/',
  'tasks/context/',
  'tasks/completed/',
  'tasks/handoffs/',
  'docs/ai/',
  'scripts/ai/',
];

let errores = 0;
let advertencias = 0;

console.log('EDURA — Bootstrap plataforma de agentes\n');

for (const ruta of requeridos) {
  const abs = join(ROOT, ruta);
  if (!existsSync(abs)) {
    console.error(`✗ FALTA: ${ruta}`);
    errores++;
  } else {
    console.log(`✓ ${ruta}`);
  }
}

// Verificar sincronización de Skills
const skillsCanon = existsSync(join(ROOT, 'agent-assets/skills')) ?
  (await import('node:fs')).readdirSync(join(ROOT, 'agent-assets/skills')).filter(f => f.endsWith('.md')) : [];
const skillsClaude = existsSync(join(ROOT, '.claude/skills')) ?
  (await import('node:fs')).readdirSync(join(ROOT, '.claude/skills')).filter(f => f.endsWith('.md')) : [];

if (skillsCanon.length !== skillsClaude.length) {
  console.warn(`\n⚠ Skills desincronizadas: canon=${skillsCanon.length}, claude=${skillsClaude.length}`);
  console.warn('  Ejecutar: pnpm ai:skills:sync');
  advertencias++;
} else {
  console.log(`\n✓ Skills sincronizadas: ${skillsCanon.length} en todas las plataformas`);
}

// Verificar Node.js >= 18
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.slice(1));
if (nodeMajor < 18) {
  console.error(`✗ Node.js ${nodeVersion} — se requiere >= 18`);
  errores++;
} else {
  console.log(`✓ Node.js ${nodeVersion}`);
}

// Verificar git
try {
  execSync('git rev-parse --git-dir', { cwd: ROOT, stdio: 'pipe' });
  console.log('✓ Repositorio Git');
} catch {
  console.error('✗ No es un repositorio Git');
  errores++;
}

console.log('\n' + '─'.repeat(40));
if (errores > 0) {
  console.error(`\nBootstrap FALLÓ: ${errores} error(es), ${advertencias} advertencia(s)`);
  process.exit(1);
} else if (advertencias > 0) {
  console.warn(`\nBootstrap OK con ${advertencias} advertencia(s)`);
} else {
  console.log('\nBootstrap OK — plataforma de agentes lista');
}
