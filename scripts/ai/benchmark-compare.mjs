#!/usr/bin/env node
/**
 * Comparación de ejecuciones benchmark EDURA.
 * Uso: node scripts/ai/benchmark-compare.mjs <runA> <runB> [--json] [--markdown]
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const RUNS_DIR = join(ROOT, '.ai/benchmarks/runs');

const args = process.argv.slice(2);
const FLAG_JSON = args.includes('--json');
const FLAG_MD = args.includes('--markdown');

function cargarRun(id) {
  // Buscar por ID exacto o por prefijo
  const candidatos = existsSync(RUNS_DIR)
    ? readdirSync(RUNS_DIR).filter(f => f.startsWith(id) && f.endsWith('.json'))
    : [];

  if (candidatos.length === 0) {
    console.error(`Run no encontrado: ${id} en ${RUNS_DIR}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(join(RUNS_DIR, candidatos[0]), 'utf8'));
}

function metrNum(run, path) {
  const partes = path.split('.');
  let obj = run?.metricas;
  for (const p of partes) {
    if (obj == null) return null;
    obj = obj[p];
  }
  return typeof obj === 'number' ? obj : null;
}

function calcularAhorro(vA, vB, metrica) {
  if (vA === null || vB === null) return { ahorro: null, porcentaje: null, nota: 'no_disponible' };
  if (vA === 0) return { ahorro: 0, porcentaje: null, nota: 'base_cero' };
  const diff = vA - vB;
  const pct = ((diff / vA) * 100).toFixed(1);
  const direccion = diff > 0 ? 'reduccion' : diff < 0 ? 'aumento' : 'igual';
  return { ahorro: diff, porcentaje: Number(pct), direccion, nota: `${pct}% ${direccion}` };
}

function comparar(runA, runB) {
  const metricas = [
    { clave: 'contexto.archivos_abiertos', label: 'Archivos abiertos' },
    { clave: 'contexto.lineas_leidas', label: 'Líneas leídas' },
    { clave: 'contexto.bytes_leidos', label: 'Bytes leídos' },
    { clave: 'herramientas.llamadas_total', label: 'Llamadas herramientas' },
    { clave: 'herramientas.llamadas_utiles', label: 'Llamadas útiles' },
    { clave: 'herramientas.mcp_llamadas', label: 'Llamadas MCP' },
    { clave: 'herramientas.reintentos', label: 'Reintentos' },
    { clave: 'skills.cargadas', label: 'Skills cargadas' },
    { clave: 'ejecucion.duracion_total_ms', label: 'Duración (ms)' },
    { clave: 'ejecucion.archivos_modificados', label: 'Archivos modificados' },
  ];

  const filas = metricas.map(m => {
    const vA = metrNum(runA, m.clave);
    const vB = metrNum(runB, m.clave);
    const ahorro = calcularAhorro(vA, vB, m.clave);
    return { ...m, vA: vA ?? 'N/D', vB: vB ?? 'N/D', ...ahorro };
  });

  const calA = runA.resultado?.calidad_total ?? null;
  const calB = runB.resultado?.calidad_total ?? null;

  return {
    run_id_A: runA.run_id,
    run_id_B: runB.run_id,
    scenario: runA.scenario_id,
    modo_A: runA.modo,
    modo_B: runB.modo,
    plataforma_A: runA.plataforma,
    plataforma_B: runB.plataforma,
    estado_A: runA.estado,
    estado_B: runB.estado,
    calidad_A: calA,
    calidad_B: calB,
    delta_calidad: calA !== null && calB !== null ? calB - calA : null,
    filas,
    advertencias: generarAdvertencias(runA, runB, filas, calA, calB),
  };
}

function generarAdvertencias(runA, runB, filas, calA, calB) {
  const warns = [];
  if (runA.estado === 'simulado' || runB.estado === 'simulado') {
    warns.push('Una o ambas ejecuciones son simuladas. Comparación parcial — sin evidencia de calidad real.');
  }
  if (runA.scenario_id !== runB.scenario_id) {
    warns.push('⚠ CRÍTICO: Los runs corresponden a escenarios diferentes. Comparación no válida.');
  }
  if (runA.entorno?.commit_inicial !== runB.entorno?.commit_inicial) {
    warns.push('Los runs usan commits diferentes. Resultado puede no ser comparable.');
  }
  const durA = metrNum(runA, 'ejecucion.duracion_total_ms');
  const durB = metrNum(runB, 'ejecucion.duracion_total_ms');
  if (durA && durB && Math.abs(durA - durB) / Math.max(durA, durB) > 0.5) {
    warns.push('Alta variabilidad de duración. Puede ser variación de red, no de eficiencia.');
  }
  if (calA !== null && calB !== null && calB < calA - 5) {
    warns.push(`⚠ Calidad B (${calB}) es 5+ puntos menor que A (${calA}). El modo optimizado puede ser peor.`);
  }
  return warns;
}

function imprimirTabla(comp) {
  console.log(`\nComparación de benchmarks EDURA\n`);
  console.log(`  Escenario : ${comp.scenario}`);
  console.log(`  A         : ${comp.run_id_A} [${comp.modo_A}/${comp.plataforma_A}] estado=${comp.estado_A}`);
  console.log(`  B         : ${comp.run_id_B} [${comp.modo_B}/${comp.plataforma_B}] estado=${comp.estado_B}`);

  console.log(`\n  Calidad:`);
  console.log(`    A: ${comp.calidad_A ?? 'N/D'}  B: ${comp.calidad_B ?? 'N/D'}  Δ: ${comp.delta_calidad ?? 'N/D'}`);

  console.log(`\n  Métricas de eficiencia:`);
  console.log(`  ${'Métrica'.padEnd(28)} ${'A'.padStart(10)} ${'B'.padStart(10)} ${'Δ%'.padStart(8)} ${'Dirección'.padEnd(12)}`);
  console.log('  ' + '─'.repeat(70));

  comp.filas.forEach(f => {
    const vA = String(f.vA).padStart(10);
    const vB = String(f.vB).padStart(10);
    const pct = f.porcentaje !== null ? `${f.porcentaje > 0 ? '-' : '+'}${Math.abs(f.porcentaje)}%`.padStart(8) : 'N/D'.padStart(8);
    const dir = f.direccion || '';
    console.log(`  ${f.label.padEnd(28)} ${vA} ${vB} ${pct} ${dir}`);
  });

  if (comp.advertencias.length > 0) {
    console.log('\n  Advertencias:');
    comp.advertencias.forEach(w => console.log(`    ⚠ ${w}`));
  }

  console.log('\n  Nota: Usar porcentajes solo cuando la muestra sea ≥3 repeticiones.\n');
}

function imprimirMarkdown(comp) {
  const lineas = [
    `# Comparación de benchmarks: ${comp.scenario}`,
    '',
    `**A**: \`${comp.run_id_A}\` [${comp.modo_A}/${comp.plataforma_A}]`,
    `**B**: \`${comp.run_id_B}\` [${comp.modo_B}/${comp.plataforma_B}]`,
    '',
    '## Calidad',
    '',
    `| Métrica | A | B | Δ |`,
    `|---------|---|---|---|`,
    `| Calidad total | ${comp.calidad_A ?? 'N/D'} | ${comp.calidad_B ?? 'N/D'} | ${comp.delta_calidad ?? 'N/D'} |`,
    '',
    '## Métricas de eficiencia',
    '',
    '| Métrica | A | B | Δ% | Dirección |',
    '|---------|---|---|-----|-----------|',
  ];

  comp.filas.forEach(f => {
    const pct = f.porcentaje !== null ? `${f.porcentaje}%` : 'N/D';
    lineas.push(`| ${f.label} | ${f.vA} | ${f.vB} | ${pct} | ${f.direccion || 'N/D'} |`);
  });

  if (comp.advertencias.length > 0) {
    lineas.push('', '## Advertencias', '');
    comp.advertencias.forEach(w => lineas.push(`- ${w}`));
  }

  lineas.push('', '> Nota: Usar porcentajes solo con muestra ≥3 repeticiones. No comparar ejecuciones simuladas como conclusivas.', '');
  console.log(lineas.join('\n'));
}

// ── Main ────────────────────────────────────────────────────────────────────

const idA = args.find(a => !a.startsWith('-'));
const idB = args.filter(a => !a.startsWith('-'))[1];

if (!idA || !idB) {
  console.error('Uso: node scripts/ai/benchmark-compare.mjs <runA> <runB> [--json] [--markdown]');
  console.error('Los IDs pueden ser el run_id completo o un prefijo.');
  process.exit(1);
}

const runA = cargarRun(idA);
const runB = cargarRun(idB);
const comp = comparar(runA, runB);

if (FLAG_JSON) { console.log(JSON.stringify(comp, null, 2)); }
else if (FLAG_MD) { imprimirMarkdown(comp); }
else { imprimirTabla(comp); }
