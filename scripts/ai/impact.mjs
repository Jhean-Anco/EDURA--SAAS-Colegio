#!/usr/bin/env node
/**
 * Análisis de impacto y validación dirigida por cambios.
 * Uso: node scripts/ai/impact.mjs [--check-changed] [--check-affected]
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const checkChanged = process.argv.includes('--check-changed');
const checkAffected = process.argv.includes('--check-affected');

// Obtener archivos modificados
let archivosModificados = [];
try {
  archivosModificados = execSync('git diff --name-only HEAD', { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(f => f.trim());
} catch { /* sin cambios */ }

if (archivosModificados.length === 0) {
  console.log('Sin archivos modificados respecto a HEAD');
  process.exit(0);
}

console.log(`Archivos modificados: ${archivosModificados.length}`);
archivosModificados.forEach(f => console.log(`  - ${f}`));

// Clasificar por área
const backFiles = archivosModificados.filter(f => f.startsWith('back/'));
const frontFiles = archivosModificados.filter(f => f.startsWith('front/'));
const aiFiles = archivosModificados.filter(f => f.startsWith('scripts/ai/') || f.startsWith('.ai/') || f.startsWith('agent-assets/'));

console.log(`\nÁreas afectadas: ${[
  backFiles.length > 0 && 'backend',
  frontFiles.length > 0 && 'frontend',
  aiFiles.length > 0 && 'plataforma-ai',
].filter(Boolean).join(', ') || 'ninguna'}`);

if (!checkChanged && !checkAffected) {
  console.log('\nUsar --check-changed o --check-affected para ejecutar validaciones');
  process.exit(0);
}

let fallos = 0;

// Lint y typecheck dirigidos
if (backFiles.length > 0 && (checkChanged || checkAffected)) {
  console.log('\n── Backend checks ──');
  try {
    execSync('npm --prefix back run lint', { cwd: ROOT, stdio: 'inherit' });
    console.log('✓ ESLint backend');
  } catch {
    console.error('✗ ESLint backend');
    fallos++;
  }

  // TypeScript solo si hay archivos .ts modificados
  if (backFiles.some(f => f.endsWith('.ts'))) {
    try {
      execSync('npm --prefix back run typecheck 2>&1', { cwd: ROOT, stdio: 'inherit' });
      console.log('✓ TypeScript backend');
    } catch {
      console.error('✗ TypeScript backend');
      fallos++;
    }
  }

  // Pruebas unitarias de archivos modificados
  if (checkAffected) {
    const specsAfectados = backFiles
      .filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts'))
      .map(f => f.replace('.ts', '.spec.ts'))
      .filter(f => existsSync(join(ROOT, f)));

    if (specsAfectados.length > 0) {
      console.log(`\nPruebas afectadas (${specsAfectados.length}):`);
      const patron = specsAfectados.map(f => f.split('/').pop().replace('.spec.ts', '')).join('|');
      try {
        execSync(
          `npm --prefix back run test -- --testPathPattern="${patron}" --passWithNoTests`,
          { cwd: ROOT, stdio: 'inherit' }
        );
        console.log('✓ Pruebas unitarias backend');
      } catch {
        console.error('✗ Pruebas unitarias backend');
        fallos++;
      }
    }
  }
}

if (frontFiles.length > 0 && (checkChanged || checkAffected)) {
  console.log('\n── Frontend checks ──');
  try {
    execSync('npm --prefix front run lint', { cwd: ROOT, stdio: 'inherit' });
    console.log('✓ ESLint frontend');
  } catch {
    console.error('✗ ESLint frontend');
    fallos++;
  }

  if (frontFiles.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) {
    try {
      execSync('npm --prefix front run typecheck', { cwd: ROOT, stdio: 'inherit' });
      console.log('✓ TypeScript frontend');
    } catch {
      console.error('✗ TypeScript frontend');
      fallos++;
    }
  }
}

console.log('\n' + '─'.repeat(40));
if (fallos > 0) {
  console.error(`\n✗ ${fallos} check(s) fallaron`);
  process.exit(1);
} else {
  console.log('\n✓ Todos los checks pasaron');
}
