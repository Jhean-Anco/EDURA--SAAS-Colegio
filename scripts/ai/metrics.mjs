#!/usr/bin/env node
/**
 * Registro y reporte de métricas de tareas EDURA.
 * Uso: node scripts/ai/metrics.mjs report [--tarea EDURA-XXX]
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const subcomando = process.argv[2];
const tareaIdx = process.argv.indexOf('--tarea');
const tareaFiltro = tareaIdx >= 0 ? process.argv[tareaIdx + 1] : null;

const METRICS_DIR = join(ROOT, '.ai/metrics');
const HANDOFFS_DIR = join(ROOT, 'tasks/handoffs');

switch (subcomando) {
  case 'report': {
    console.log('EDURA — Reporte de métricas\n');

    // Leer handoffs como fuente de métricas
    if (!existsSync(HANDOFFS_DIR)) {
      console.log('No hay handoffs registrados aún');
      process.exit(0);
    }

    const handoffs = readdirSync(HANDOFFS_DIR)
      .filter(f => f.endsWith('.handoff.json'))
      .filter(f => !tareaFiltro || f.startsWith(tareaFiltro))
      .map(f => {
        try {
          return JSON.parse(readFileSync(join(HANDOFFS_DIR, f), 'utf8'));
        } catch { return null; }
      })
      .filter(Boolean);

    if (handoffs.length === 0) {
      console.log('No hay handoffs que reportar');
      process.exit(0);
    }

    const total = handoffs.length;
    const implementadas = handoffs.filter(h => h.estado === 'implementado').length;
    const parciales = handoffs.filter(h => h.estado === 'parcial').length;
    const bloqueadas = handoffs.filter(h => h.estado === 'bloqueado').length;
    const totalArchivos = handoffs.reduce((s, h) => s + (h.metricas?.archivos_modificados ?? 0), 0);

    console.log(`Tareas totales:      ${total}`);
    console.log(`  Implementadas:     ${implementadas}`);
    console.log(`  Parciales:         ${parciales}`);
    console.log(`  Bloqueadas:        ${bloqueadas}`);
    console.log(`Archivos modificados total: ${totalArchivos}`);
    console.log(`Promedio archivos/tarea:    ${total > 0 ? (totalArchivos / total).toFixed(1) : 0}`);

    if (tareaFiltro) {
      const handoff = handoffs[0];
      console.log(`\nDetalle ${tareaFiltro}:`);
      console.log(`  Estado: ${handoff.estado}`);
      console.log(`  Archivos: ${handoff.archivosModificados?.length ?? 0}`);
      console.log(`  Pendientes: ${handoff.pendientes?.length ?? 0}`);
      console.log(`  Riesgos: ${handoff.riesgos?.length ?? 0}`);
    }

    console.log('\nIndicadores de desperdicio:');
    const conPendientes = handoffs.filter(h => (h.pendientes?.length ?? 0) > 0).length;
    console.log(`  Tareas con pendientes: ${conPendientes}/${total}`);
    const conRiesgos = handoffs.filter(h => (h.riesgos?.length ?? 0) > 0).length;
    console.log(`  Tareas con riesgos:    ${conRiesgos}/${total}`);
    break;
  }

  default:
    console.error(`Subcomando desconocido: ${subcomando}`);
    console.error('Subcomandos: report [--tarea EDURA-XXX]');
    process.exit(1);
}
