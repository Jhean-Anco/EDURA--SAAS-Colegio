#!/usr/bin/env node
/**
 * Comprime errores de logs y salida de comandos.
 * Uso: node scripts/ai/errors.mjs [--file <archivo>] o stdin
 */
import { readFileSync } from 'node:fs';

let input = '';

if (process.argv.includes('--file')) {
  const fileIdx = process.argv.indexOf('--file');
  const file = process.argv[fileIdx + 1];
  input = readFileSync(file, 'utf8');
} else if (!process.stdin.isTTY) {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  input = Buffer.concat(chunks).toString('utf8');
} else {
  console.error('Uso: pnpm ai:errors -- --file <archivo>');
  console.error('  o: <comando> | pnpm ai:errors');
  process.exit(1);
}

const lineas = input.split('\n');

// Patrones de error
const patronesError = [
  /error\s*:/i,
  /Error:/,
  /FAIL\s/,
  /✗/,
  /× /,
  /^\s*at\s+.+\(.+:\d+:\d+\)/,  // stack trace (solo líneas de usuario)
  /TS\d{4}:/,  // TypeScript errors
  /\[error\]/i,
];

// Patrones a eliminar (node_modules, generados)
const patronesIgnorar = [
  /node_modules/,
  /\.next\//,
  /dist\//,
  /coverage\//,
];

const erroresEncontrados = new Map();
const archivosAfectados = new Set();

for (const linea of lineas) {
  if (patronesIgnorar.some(p => p.test(linea))) continue;
  if (!patronesError.some(p => p.test(linea))) continue;

  const normalizada = linea.trim();
  if (erroresEncontrados.has(normalizada)) continue;

  erroresEncontrados.set(normalizada, true);

  const matchArchivo = normalizada.match(/([^\s]+\.[a-z]+):(\d+)/);
  if (matchArchivo) archivosAfectados.add(matchArchivo[1]);
}

const erroresList = [...erroresEncontrados.keys()].slice(0, 20);

console.log(`Errores encontrados: ${erroresEncontrados.size}`);
console.log(`Archivos afectados: ${archivosAfectados.size}`);
if (archivosAfectados.size > 0) {
  console.log([...archivosAfectados].map(a => `  - ${a}`).join('\n'));
}
console.log();

erroresList.forEach((e, i) => console.log(`${i + 1}. ${e}`));

if (erroresEncontrados.size > 20) {
  console.log(`\n+${erroresEncontrados.size - 20} errores adicionales (mismo patrón)`);
}
