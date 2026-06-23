#!/usr/bin/env node
/**
 * Muestra el diff actual comprimido y seguro.
 * Uso: node scripts/ai/diff.mjs [--staged]
 */
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const staged = process.argv.includes('--staged');
const cmd = staged ? 'git diff --staged' : 'git diff HEAD';

try {
  const stat = execSync(`${cmd} --stat`, { cwd: ROOT, encoding: 'utf8' });
  const diff = execSync(cmd, { cwd: ROOT, encoding: 'utf8' });

  console.log('EDURA — Diff actual\n');
  console.log(stat);

  // Advertencias de seguridad
  const patronesSecretos = ['password', 'secret', 'token', 'apikey', 'api_key', 'private_key'];
  const lineasPeligrosas = diff.split('\n')
    .filter(l => l.startsWith('+') && !l.startsWith('+++'))
    .filter(l => patronesSecretos.some(p => l.toLowerCase().includes(p)));

  if (lineasPeligrosas.length > 0) {
    console.error('⚠ ADVERTENCIA: Posibles secretos en el diff:');
    lineasPeligrosas.slice(0, 5).forEach(l => console.error(`  ${l}`));
  }

  // Estadísticas
  const archivos = stat.split('\n').filter(l => l.includes('|')).length;
  const adiciones = (diff.match(/^\+[^+]/mg) || []).length;
  const eliminaciones = (diff.match(/^-[^-]/mg) || []).length;
  console.log(`\nResumen: ${archivos} archivos, +${adiciones}/-${eliminaciones} líneas`);

} catch (e) {
  if (e.message.includes('not a git')) {
    console.error('No es un repositorio Git');
    process.exit(1);
  }
  console.log('Sin cambios en el repositorio');
}
