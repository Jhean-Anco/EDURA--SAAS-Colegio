#!/usr/bin/env node
/**
 * Genera el manifiesto compacto de un módulo NestJS.
 * Uso: node scripts/ai/generate-module-manifest.mjs <nombre-modulo>
 */
import { existsSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const modulo = process.argv[2];

if (!modulo) {
  console.error('Uso: node scripts/ai/generate-module-manifest.mjs <nombre-modulo>');
  process.exit(1);
}

const moduloPath = join(ROOT, 'back/src/modulos', modulo);
if (!existsSync(moduloPath)) {
  console.error(`Módulo no encontrado: back/src/modulos/${modulo}`);
  process.exit(1);
}

function ls(ruta) {
  if (!existsSync(ruta)) return [];
  return readdirSync(ruta).filter(f => f.endsWith('.ts'));
}

function buscarPatron(patron) {
  try {
    return execSync(
      `rg "${patron}" back/src/modulos/${modulo}/ -l --glob=!**/*.spec.ts`,
      { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }
    ).trim().split('\n').filter(Boolean).map(f => f.replace(ROOT, '').replace(/\\/g, '/').replace(/^\//, ''));
  } catch { return []; }
}

const manifiesto = {
  modulo,
  ruta: `back/src/modulos/${modulo}`,
  generado: new Date().toISOString().slice(0, 10),
  archivos: {
    modulo: `back/src/modulos/${modulo}/${modulo}.module.ts`,
    casosDeUso: ls(join(moduloPath, 'aplicacion/casos-de-uso')).map(f => `aplicacion/casos-de-uso/${f}`),
    dtos: ls(join(moduloPath, 'aplicacion/dtos')).map(f => `aplicacion/dtos/${f}`),
    entidades: ls(join(moduloPath, 'dominio/entidades')).map(f => `dominio/entidades/${f}`),
    repositoriosInterfaz: ls(join(moduloPath, 'dominio/repositorios')).map(f => `dominio/repositorios/${f}`),
    repositoriosImpl: ls(join(moduloPath, 'infraestructura/repositorios')).map(f => `infraestructura/repositorios/${f}`),
    controladores: ls(join(moduloPath, 'presentacion/controladores')).map(f => `presentacion/controladores/${f}`),
  },
  controladores: buscarPatron('@Controller'),
  entidades_typeorm: buscarPatron('@Entity'),
};

const outDir = join(ROOT, 'docs/ai/context');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${modulo}.manifest.json`);
writeFileSync(outPath, JSON.stringify(manifiesto, null, 2));
console.log(`✓ Manifiesto generado: docs/ai/context/${modulo}.manifest.json`);
console.log(`  Casos de uso: ${manifiesto.archivos.casosDeUso.length}`);
console.log(`  Entidades: ${manifiesto.archivos.entidades.length}`);
console.log(`  Controladores: ${manifiesto.archivos.controladores.length}`);
