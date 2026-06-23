#!/usr/bin/env node
/**
 * Lectura limitada de archivo con rango de líneas.
 * Uso: node scripts/ai/read.mjs <archivo> [--from N] [--to N]
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const args = process.argv.slice(2);
const archivo = args[0];

if (!archivo) {
  console.error('Uso: pnpm ai:read -- <archivo> [--from N] [--to N]');
  process.exit(1);
}

// Seguridad: rechazar rutas de secretos
const patronesProhibidos = ['.env', '.pem', '.key', '.p12', 'secret', 'credential'];
if (patronesProhibidos.some(p => archivo.toLowerCase().includes(p))) {
  console.error(`Lectura rechazada por política de seguridad: ${archivo}`);
  process.exit(1);
}

const fromIdx = args.indexOf('--from');
const toIdx = args.indexOf('--to');
const desde = fromIdx >= 0 ? parseInt(args[fromIdx + 1]) : 1;
const hasta = toIdx >= 0 ? parseInt(args[toIdx + 1]) : desde + 299;

if (hasta - desde > 300) {
  console.warn(`⚠ Rango solicitado (${hasta - desde} líneas) supera el límite de 300. Truncando.`);
}
const hastaLimitado = Math.min(hasta, desde + 299);

const rutaAbs = join(ROOT, archivo);
if (!existsSync(rutaAbs)) {
  console.error(`Archivo no encontrado: ${archivo}`);
  process.exit(1);
}

const lineas = readFileSync(rutaAbs, 'utf8').split('\n');
const total = lineas.length;
const seleccion = lineas.slice(desde - 1, hastaLimitado);

console.log(`📄 ${archivo} (líneas ${desde}-${hastaLimitado} de ${total})\n`);
seleccion.forEach((l, i) => {
  console.log(`${String(desde + i).padStart(4)}: ${l}`);
});

if (hastaLimitado < total) {
  console.log(`\n... (${total - hastaLimitado} líneas más — usar --from ${hastaLimitado + 1})`);
}
