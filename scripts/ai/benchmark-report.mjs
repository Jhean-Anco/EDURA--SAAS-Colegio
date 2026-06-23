#!/usr/bin/env node
/**
 * Generador de reportes de benchmark EDURA.
 * Genera Markdown, JSON y CSV.
 *
 * Uso:
 *   node scripts/ai/benchmark-report.mjs [--scenario <id>] [--platform <p>] [--mode <m>]
 *   node scripts/ai/benchmark-report.mjs --markdown --json --csv
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const RUNS_DIR = join(ROOT, '.ai/benchmarks/runs');
const REPORTS_DIR = join(ROOT, '.ai/benchmarks/reports');
const DOCS_REPORTS_DIR = join(ROOT, 'docs/ai/reports');

const args = process.argv.slice(2);
const FLAG_JSON = args.includes('--json');
const FLAG_MD = args.includes('--markdown');
const FLAG_CSV = args.includes('--csv');
const getArg = (f, d = null) => { const i = args.indexOf(f); return i !== -1 && args[i + 1] ? args[i + 1] : d; };

const filterScenario = getArg('--scenario');
const filterPlatform = getArg('--platform');
const filterMode = getArg('--mode');

// ── Cargar runs ──────────────────────────────────────────────────────────────

function cargarRuns() {
  if (!existsSync(RUNS_DIR)) return [];
  return readdirSync(RUNS_DIR)
    .filter(f => f.endsWith('.json') && !f.includes('.quality') && !f.includes('.events'))
    .map(f => {
      try { return JSON.parse(readFileSync(join(RUNS_DIR, f), 'utf8')); }
      catch { return null; }
    })
    .filter(Boolean)
    .filter(r => {
      if (filterScenario && r.scenario_id !== filterScenario) return false;
      if (filterPlatform && r.plataforma !== filterPlatform) return false;
      if (filterMode && r.modo !== filterMode) return false;
      return true;
    });
}

// ── Calcular métricas derivadas ──────────────────────────────────────────────

function derivadas(run) {
  const c = run.metricas?.contexto || {};
  const h = run.metricas?.herramientas || {};
  const s = run.metricas?.skills || {};
  const e = run.metricas?.ejecucion || {};
  const div = (a, b) => (typeof a === 'number' && typeof b === 'number' && b > 0) ? Number((a / b).toFixed(3)) : 'no_aplicable';
  return {
    eficiencia_contexto: div(e.archivos_modificados, c.archivos_abiertos),
    eficiencia_herramientas: div(h.llamadas_utiles, h.llamadas_total),
    eficiencia_skills: div(s.utilizadas, s.cargadas),
    sobrecarga_mcp: div(h.mcp_llamadas, h.llamadas_total),
  };
}

// ── Generar tabla resumen ────────────────────────────────────────────────────

function generarTablaMarkdown(runs) {
  const cabecera = '| Escenario | Plataforma | Modo | Calidad | Archivos | Llamadas | MCP | Skills | Duración | Estado |';
  const sep = '|-----------|------------|------|--------:|---------:|---------:|----:|-------:|---------:|--------|';

  const filas = runs.map(r => {
    const cal = r.resultado?.calidad_total ?? 'N/D';
    const arch = r.metricas?.contexto?.archivos_abiertos ?? 'N/D';
    const llam = r.metricas?.herramientas?.llamadas_total ?? 'N/D';
    const mcp = r.metricas?.herramientas?.mcp_llamadas ?? 'N/D';
    const skills = r.metricas?.skills?.cargadas ?? 'N/D';
    const dur = r.metricas?.ejecucion?.duracion_total_ms ? `${r.metricas.ejecucion.duracion_total_ms}ms` : 'N/D';
    return `| ${r.scenario_id} | ${r.plataforma} | ${r.modo} | ${cal} | ${arch} | ${llam} | ${mcp} | ${skills} | ${dur} | ${r.estado} |`;
  });

  return [cabecera, sep, ...filas].join('\n');
}

function generarCSV(runs) {
  const campos = ['run_id', 'scenario_id', 'plataforma', 'modo', 'estado', 'calidad_total',
    'archivos_abiertos', 'lineas_leidas', 'llamadas_total', 'mcp_llamadas', 'skills_cargadas',
    'duracion_ms', 'secretos_detectados', 'cambios_fuera_alcance'];
  const cabecera = campos.join(',');

  const filas = runs.map(r => campos.map(c => {
    const v = {
      run_id: r.run_id, scenario_id: r.scenario_id, plataforma: r.plataforma,
      modo: r.modo, estado: r.estado,
      calidad_total: r.resultado?.calidad_total ?? '',
      archivos_abiertos: r.metricas?.contexto?.archivos_abiertos ?? '',
      lineas_leidas: r.metricas?.contexto?.lineas_leidas ?? '',
      llamadas_total: r.metricas?.herramientas?.llamadas_total ?? '',
      mcp_llamadas: r.metricas?.herramientas?.mcp_llamadas ?? '',
      skills_cargadas: r.metricas?.skills?.cargadas ?? '',
      duracion_ms: r.metricas?.ejecucion?.duracion_total_ms ?? '',
      secretos_detectados: r.resultado?.secretos_detectados ?? '',
      cambios_fuera_alcance: r.resultado?.cambios_fuera_alcance ?? '',
    }[c];
    return v ?? '';
  }).join(',')).join('\n');

  return `${cabecera}\n${filas}`;
}

function generarMarkdownCompleto(runs, fecha) {
  const tabla = generarTablaMarkdown(runs);
  return `# Reporte de Eficiencia Multiagente — EDURA AI Efficiency Governance

**Fecha:** ${fecha}
**Ejecuciones analizadas:** ${runs.length}
**Filtros:** escenario=${filterScenario || 'todos'} plataforma=${filterPlatform || 'todas'} modo=${filterMode || 'todos'}

## Resumen ejecutivo

${tabla}

## Métricas derivadas por ejecución

${runs.map(r => {
  const d = derivadas(r);
  return `### ${r.run_id} (${r.scenario_id} / ${r.modo})
- Eficiencia contexto (archivos mod / abiertos): ${d.eficiencia_contexto}
- Eficiencia herramientas (útiles / totales): ${d.eficiencia_herramientas}
- Eficiencia Skills (usadas / cargadas): ${d.eficiencia_skills}
- Sobrecarga MCP (llamadas MCP / totales): ${d.sobrecarga_mcp}`;
}).join('\n\n')}

## Limitaciones de este reporte

- Las ejecuciones marcadas como **simulado** no tienen calidad funcional real evaluada.
- Los tokens no están disponibles para plataformas Codex y Antigravity — se usan bytes/líneas como proxy.
- No comparar ejecuciones en diferentes commits sin registrarlo.
- Porcentajes son indicativos con n < 3 repeticiones.

## Datos sin disponibilidad

- **Tokens reales**: No disponibles en modo simulación ni Codex CLI.
- **Costo**: No calculable sin tokens verificados.
- **Calidad funcional**: Requiere evaluación con agente real.
- **Antigravity**: Plataforma no detectada — sin datos.

---
*Generado por EDURA AI Efficiency Governance v1.0*
`;
}

// ── Main ────────────────────────────────────────────────────────────────────

const runs = cargarRuns();
const fecha = new Date().toISOString();

if (runs.length === 0) {
  console.log('\nSin ejecuciones para reportar.');
  console.log('Ejecutar primero: pnpm ai:benchmark:run -- BEN-MEC-001 --dry-run\n');
  process.exit(0);
}

const reporte = { generado: fecha, total_runs: runs.length, runs: runs.map(r => ({ ...r, metricas_derivadas: derivadas(r) })) };

// Guardar siempre JSON
const jsonPath = join(REPORTS_DIR, `reporte-${fecha.slice(0, 10)}.json`);
writeFileSync(jsonPath, JSON.stringify(reporte, null, 2), 'utf8');

// CSV
const csvPath = join(REPORTS_DIR, `reporte-${fecha.slice(0, 10)}.csv`);
writeFileSync(csvPath, generarCSV(runs), 'utf8');

// Markdown
const md = generarMarkdownCompleto(runs, fecha);
const mdPathLocal = join(REPORTS_DIR, `reporte-${fecha.slice(0, 10)}.md`);
const mdPathDocs = join(DOCS_REPORTS_DIR, 'eficiencia-multiagente.md');
writeFileSync(mdPathLocal, md, 'utf8');
writeFileSync(mdPathDocs, md, 'utf8');

if (FLAG_JSON) { console.log(JSON.stringify(reporte, null, 2)); }
else if (FLAG_MD) { console.log(md); }
else if (FLAG_CSV) { console.log(generarCSV(runs)); }
else {
  console.log(`\nReporte generado (${runs.length} ejecuciones):`);
  console.log(`  JSON     : ${jsonPath}`);
  console.log(`  CSV      : ${csvPath}`);
  console.log(`  Markdown : ${mdPathLocal}`);
  console.log(`  Docs     : ${mdPathDocs}`);
  runs.forEach(r => {
    const cal = r.resultado?.calidad_total ?? 'N/D';
    console.log(`  • ${r.run_id.padEnd(30)} ${r.scenario_id.padEnd(20)} ${r.modo.padEnd(20)} calidad=${cal} estado=${r.estado}`);
  });
  console.log('');
}
