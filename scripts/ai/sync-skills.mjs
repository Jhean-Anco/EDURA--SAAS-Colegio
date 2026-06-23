#!/usr/bin/env node
/**
 * Sincronización de Skills desde la fuente canónica.
 * Uso: node scripts/ai/sync-skills.mjs [--check]
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const checkMode = process.argv.includes('--check');

const CANON = join(ROOT, 'agent-assets/skills');
const DESTINOS = [
  join(ROOT, '.claude/skills'),
  join(ROOT, '.agents/skills'),
];

if (!existsSync(CANON)) {
  console.error('Directorio canónico no encontrado: agent-assets/skills/');
  process.exit(1);
}

function hash(contenido) {
  return createHash('sha256').update(contenido).digest('hex').slice(0, 12);
}

const skillsCanon = readdirSync(CANON).filter(f => f.endsWith('.md'));
let divergencias = 0;

console.log(`Skills canónicas: ${skillsCanon.length}\n`);

for (const destino of DESTINOS) {
  if (!existsSync(destino)) {
    if (checkMode) {
      console.warn(`⚠ Directorio destino no existe: ${destino}`);
      divergencias++;
      continue;
    }
    mkdirSync(destino, { recursive: true });
  }

  const skillsDestino = existsSync(destino) ?
    readdirSync(destino).filter(f => f.endsWith('.md')) : [];

  // Detectar skills extra en destino
  const extras = skillsDestino.filter(s => !skillsCanon.includes(s));
  if (extras.length > 0) {
    console.warn(`⚠ Skills extras en ${basename(destino)}: ${extras.join(', ')}`);
    divergencias += extras.length;
  }

  // Verificar cada skill canónica
  for (const skill of skillsCanon) {
    const canonPath = join(CANON, skill);
    const destPath = join(destino, skill);
    const canonContent = readFileSync(canonPath, 'utf8');
    const canonHash = hash(canonContent);

    if (!existsSync(destPath)) {
      if (checkMode) {
        console.error(`✗ Falta en ${basename(destino)}: ${skill}`);
        divergencias++;
      } else {
        copyFileSync(canonPath, destPath);
        console.log(`✓ Copiada: ${skill} → ${basename(destino)}`);
      }
    } else {
      const destContent = readFileSync(destPath, 'utf8');
      const destHash = hash(destContent);
      if (canonHash !== destHash) {
        if (checkMode) {
          console.error(`✗ Diverge en ${basename(destino)}: ${skill}`);
          divergencias++;
        } else {
          copyFileSync(canonPath, destPath);
          console.log(`↻ Actualizada: ${skill} → ${basename(destino)}`);
        }
      }
    }
  }
}

if (checkMode) {
  if (divergencias > 0) {
    console.error(`\n✗ ${divergencias} divergencia(s) — ejecutar: pnpm ai:skills:sync`);
    process.exit(1);
  } else {
    console.log('✓ Todas las Skills están sincronizadas');
  }
} else {
  console.log(`\n✓ Sincronización completada`);
}
