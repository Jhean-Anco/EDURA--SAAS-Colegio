#!/usr/bin/env node
/**
 * Búsqueda limitada y filtrada en el repositorio EDURA.
 * Uso: node scripts/ai/search.mjs "<patrón>" [--glob "<glob>"] [--max <N>]
 */
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const args = process.argv.slice(2);
const patron = args[0];

if (!patron) {
  console.error('Uso: pnpm ai:search -- "<patrón>" [--glob "<glob>"] [--max <N>]');
  process.exit(1);
}

const globIdx = args.indexOf('--glob');
const glob = globIdx >= 0 ? args[globIdx + 1] : '**/*.ts';
const maxIdx = args.indexOf('--max');
const max = maxIdx >= 0 ? parseInt(args[maxIdx + 1]) : 20;

// Exclusiones fijas
const exclusiones = [
  '--glob=!**/node_modules/**',
  '--glob=!**/dist/**',
  '--glob=!**/.next/**',
  '--glob=!**/coverage/**',
  '--glob=!**/*.env*',
  '--glob=!**/docs/ai/generated/**',
];

try {
  const resultado = execSync(
    `rg "${patron}" --glob="${glob}" ${exclusiones.join(' ')} -n --max-count=3 -l`,
    { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }
  );

  const archivos = resultado.trim().split('\n').filter(Boolean).slice(0, max);

  if (archivos.length === 0) {
    console.log(`Sin resultados para: ${patron}`);
    process.exit(0);
  }

  console.log(`Resultados (${archivos.length} archivos):\n`);

  for (const archivo of archivos) {
    const lineas = execSync(
      `rg "${patron}" "${archivo}" -n --max-count=5`,
      { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }
    ).trim();
    console.log(`📄 ${archivo}`);
    console.log(lineas.split('\n').map(l => `   ${l}`).join('\n'));
    console.log();
  }

  if (archivos.length === max) {
    console.log(`(Limitado a ${max} archivos — usa --max N para más)`);
  }
} catch (e) {
  if (e.status === 1) {
    console.log(`Sin resultados para: ${patron}`);
  } else {
    console.error('Error al ejecutar búsqueda:', e.message);
    process.exit(1);
  }
}
