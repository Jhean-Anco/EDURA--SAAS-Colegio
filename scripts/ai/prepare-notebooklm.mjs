#!/usr/bin/env node
/**
 * Preparación de fuentes para NotebookLM (sanitización y staging).
 * Uso: node scripts/ai/prepare-notebooklm.mjs [--cuaderno <nombre>]
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, statSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const cuadernoIdx = process.argv.indexOf('--cuaderno');
const cuaderno = cuadernoIdx >= 0 ? process.argv[cuadernoIdx + 1] : 'general';

const STAGING = join(ROOT, 'docs/notebooklm/staging');
mkdirSync(STAGING, { recursive: true });

// Documentos autorizados para NotebookLM
const FUENTES_AUTORIZADAS = [
  { ruta: 'docs/ARQUITECTURA.md', cuadernos: ['arquitectura', 'general'] },
  { ruta: 'docs/ESTADO-MAESTRO.md', cuadernos: ['arquitectura', 'general'] },
  { ruta: 'docs/DICCIONARIO-DATOS.md', cuadernos: ['base-datos', 'general'] },
  { ruta: 'docs/ai/architecture.md', cuadernos: ['arquitectura', 'general'] },
  { ruta: 'docs/ai/api-map.md', cuadernos: ['api', 'general'] },
  { ruta: 'docs/ai/conventions.md', cuadernos: ['general'] },
  { ruta: 'AGENTS.md', cuadernos: ['general'] },
];

// Patrones de contenido a excluir (redactar)
const PATRONES_SECRETO = [
  /password\s*[:=]\s*\S+/gi,
  /secret\s*[:=]\s*\S+/gi,
  /token\s*[:=]\s*\S+/gi,
  /api[_-]?key\s*[:=]\s*\S+/gi,
  /jwt[_-]?secret\s*[:=]\s*\S+/gi,
  /DATABASE_URL\s*=\s*\S+/gi,
];

function sanitizar(contenido) {
  let resultado = contenido;
  for (const patron of PATRONES_SECRETO) {
    resultado = resultado.replace(patron, (m) => m.split('=')[0] + '=[REDACTADO]');
  }
  return resultado;
}

function hash(contenido) {
  return createHash('sha256').update(contenido).digest('hex').slice(0, 12);
}

console.log(`EDURA — Preparando fuentes NotebookLM (cuaderno: ${cuaderno})\n`);

const manifiesto = { cuaderno, generado: new Date().toISOString(), fuentes: [] };
let preparadas = 0;
let omitidas = 0;

for (const fuente of FUENTES_AUTORIZADAS) {
  if (cuaderno !== 'general' && !fuente.cuadernos.includes(cuaderno)) {
    omitidas++;
    continue;
  }

  const rutaAbs = join(ROOT, fuente.ruta);
  if (!existsSync(rutaAbs)) {
    console.warn(`⚠ No encontrado: ${fuente.ruta}`);
    omitidas++;
    continue;
  }

  const contenido = readFileSync(rutaAbs, 'utf8');

  // Verificar tamaño (límite 500KB por documento)
  if (contenido.length > 500_000) {
    console.warn(`⚠ Demasiado extenso (${(contenido.length / 1024).toFixed(0)}KB): ${fuente.ruta}`);
    console.warn('  Dividir manualmente antes de cargar a NotebookLM');
    omitidas++;
    continue;
  }

  const sanitizado = sanitizar(contenido);
  const nombreSalida = fuente.ruta.replace(/[/\\]/g, '_');
  const hashDocumento = hash(sanitizado);

  writeFileSync(join(STAGING, nombreSalida), sanitizado);

  manifiesto.fuentes.push({
    original: fuente.ruta,
    staging: nombreSalida,
    hash: hashDocumento,
    tamano_bytes: sanitizado.length,
    cuadernos: fuente.cuadernos,
  });

  console.log(`✓ ${fuente.ruta} → ${nombreSalida}`);
  preparadas++;
}

// Guardar manifiesto
writeFileSync(
  join(STAGING, 'manifest.json'),
  JSON.stringify(manifiesto, null, 2)
);

console.log(`\nPreparadas: ${preparadas} | Omitidas: ${omitidas}`);
console.log(`Manifiesto: docs/notebooklm/staging/manifest.json`);
console.log('\nNOTA: Verificar staging/ antes de cargar a NotebookLM.');
console.log('La carga es un paso manual — las credenciales no están en el repositorio.');
