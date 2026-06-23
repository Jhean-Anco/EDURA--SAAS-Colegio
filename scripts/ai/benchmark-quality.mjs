#!/usr/bin/env node
/**
 * Evaluador de calidad de ejecuciones benchmark EDURA.
 * Aplica la rúbrica de calidad-general.yaml a un run.
 *
 * Uso: node scripts/ai/benchmark-quality.mjs <run_id> [--json] [--manual]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const RUNS_DIR = join(ROOT, '.ai/benchmarks/runs');

const args = process.argv.slice(2);
const runId = args[0];
const FLAG_JSON = args.includes('--json');
const FLAG_MANUAL = args.includes('--manual');

if (!runId || runId.startsWith('--')) {
  console.error('Uso: node scripts/ai/benchmark-quality.mjs <run_id> [--json] [--manual]');
  process.exit(1);
}

function cargarRun(id) {
  const candidatos = existsSync(RUNS_DIR)
    ? require('node:fs').readdirSync(RUNS_DIR).filter(f => f.startsWith(id) && f.endsWith('.json'))
    : [];
  if (candidatos.length === 0) { console.error(`Run no encontrado: ${id}`); process.exit(1); }
  return JSON.parse(readFileSync(join(RUNS_DIR, candidatos[0]), 'utf8'));
}

// ── Evaluación automática ───────────────────────────────────────────────────

function evaluarAutomatico(run) {
  const dim = {
    correccion_funcional: { puntos_maximos: 40, puntos_obtenidos: 0, criterios: [] },
    alcance:              { puntos_maximos: 15, puntos_obtenidos: 0, criterios: [] },
    arquitectura:         { puntos_maximos: 15, puntos_obtenidos: 15, criterios: [], nota: 'evaluacion_manual_requerida' },
    seguridad:            { puntos_maximos: 15, puntos_obtenidos: 0, criterios: [] },
    calidad_interna:      { puntos_maximos: 10, puntos_obtenidos: 5,  criterios: [], nota: 'evaluacion_parcial' },
    entrega:              { puntos_maximos: 5,  puntos_obtenidos: 0,  criterios: [] },
  };

  const res = run.resultado || {};
  const bloqueos = [];

  // Corrección funcional
  if (res.exito_tecnico) dim.correccion_funcional.puntos_obtenidos += 15;
  if (res.typecheck === 'pasado') dim.correccion_funcional.puntos_obtenidos += 10;
  if (res.pruebas === 'pasado') dim.correccion_funcional.puntos_obtenidos += 10;
  if (res.regresiones === 0 || res.regresiones === undefined) dim.correccion_funcional.puntos_obtenidos += 5;

  // Alcance
  if (res.cambios_fuera_alcance === 0 || res.cambios_fuera_alcance === undefined) {
    dim.alcance.puntos_obtenidos += 7;
  } else {
    bloqueos.push({ tipo: 'cambio_fuera_alcance_critico', descripcion: `${res.cambios_fuera_alcance} cambios fuera de alcance` });
  }
  dim.alcance.puntos_obtenidos += 4; // dependencias — asumir OK en simulación
  dim.alcance.puntos_obtenidos += 4; // archivos redundantes — asumir OK

  // Seguridad
  if (res.secretos_detectados === 0 || res.secretos_detectados === undefined) {
    dim.seguridad.puntos_obtenidos += 5;
  } else {
    bloqueos.push({ tipo: 'secreto_detectado', descripcion: `${res.secretos_detectados} secretos detectados` });
  }
  // Autorización y multitenencia — evaluación manual
  dim.seguridad.puntos_obtenidos += 5;
  dim.seguridad.puntos_obtenidos += 5;
  dim.seguridad.nota = 'autorización y multitenencia requieren evaluación manual';

  // Entrega
  if (res.exito_tecnico) dim.entrega.puntos_obtenidos += 2;
  if (res.pruebas !== 'fallido') dim.entrega.puntos_obtenidos += 2;
  if (res.cambios_fuera_alcance === 0) dim.entrega.puntos_obtenidos += 1;

  // Si es simulación, penalizar funcional
  let notaGeneral = null;
  if (run.estado === 'simulado') {
    Object.values(dim).forEach(d => {
      d.puntos_obtenidos = Math.min(d.puntos_obtenidos, d.puntos_maximos * 0.5);
    });
    notaGeneral = 'Ejecución simulada — puntuación reducida al 50%. No conclusiva.';
  }

  const total = Object.values(dim).reduce((s, d) => s + d.puntos_obtenidos, 0);

  const aceptada = bloqueos.length === 0 && total >= 85 && run.estado !== 'simulado';

  return {
    run_id: run.run_id,
    evaluador: 'automatico',
    fecha: new Date().toISOString(),
    dimensiones: dim,
    calidad_total: Math.round(total * 10) / 10,
    aceptada,
    motivo_rechazo: !aceptada
      ? (run.estado === 'simulado' ? 'Simulación — evaluación no conclusiva'
        : bloqueos.length > 0 ? 'Bloqueos críticos detectados'
        : 'Calidad por debajo de 85')
      : null,
    bloqueos,
    notas: notaGeneral,
  };
}

// ── Main ────────────────────────────────────────────────────────────────────

import { readdirSync } from 'node:fs';

function cargarRunv2(id) {
  const candidatos = existsSync(RUNS_DIR)
    ? readdirSync(RUNS_DIR).filter(f => f.startsWith(id) && f.endsWith('.json'))
    : [];
  if (candidatos.length === 0) { console.error(`Run no encontrado: ${id}`); process.exit(1); }
  return JSON.parse(readFileSync(join(RUNS_DIR, candidatos[0]), 'utf8'));
}

const run = cargarRunv2(runId);
const evaluacion = evaluarAutomatico(run);

// Persistir evaluación
const evalPath = join(RUNS_DIR, `${run.run_id}.quality.json`);
writeFileSync(evalPath, JSON.stringify(evaluacion, null, 2), 'utf8');

if (FLAG_JSON) {
  console.log(JSON.stringify(evaluacion, null, 2));
} else {
  console.log(`\nEvaluación de calidad: ${run.run_id}\n`);
  console.log(`  Estado run   : ${run.estado}`);
  console.log(`  Calidad total: ${evaluacion.calidad_total}/100`);
  console.log(`  Aceptada     : ${evaluacion.aceptada ? 'SÍ' : 'NO'}`);
  if (evaluacion.motivo_rechazo) console.log(`  Rechazo      : ${evaluacion.motivo_rechazo}`);

  console.log('\n  Dimensiones:');
  Object.entries(evaluacion.dimensiones).forEach(([k, d]) => {
    console.log(`    ${k.padEnd(22)}: ${d.puntos_obtenidos}/${d.puntos_maximos}${d.nota ? ` (${d.nota})` : ''}`);
  });

  if (evaluacion.bloqueos.length > 0) {
    console.log('\n  Bloqueos:');
    evaluacion.bloqueos.forEach(b => console.log(`    ✗ [${b.tipo}] ${b.descripcion}`));
  }

  if (evaluacion.notas) console.log(`\n  Nota: ${evaluacion.notas}`);
  console.log(`\n  Guardado en: ${evalPath}\n`);
}
