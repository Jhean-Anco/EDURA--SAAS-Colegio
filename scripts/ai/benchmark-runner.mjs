#!/usr/bin/env node
/**
 * Runner principal de benchmarks EDURA AI Efficiency Governance.
 *
 * Uso:
 *   node scripts/ai/benchmark-runner.mjs list
 *   node scripts/ai/benchmark-runner.mjs validate [--scenario <id>]
 *   node scripts/ai/benchmark-runner.mjs plan --scenario <id>
 *   node scripts/ai/benchmark-runner.mjs run --scenario <id> [--dry-run] [--paid] [--mode <modo>]
 *   node scripts/ai/benchmark-runner.mjs run --suite <suite> [--dry-run] [--paid]
 *   node scripts/ai/benchmark-runner.mjs baseline-create [--scenario <id>]
 *   node scripts/ai/benchmark-runner.mjs baseline-check [--scenario <id>]
 *
 * Flags:
 *   --dry-run              Simular sin ejecutar agente real
 *   --paid                 Requerido para benchmarks con costo de API
 *   --mode <modo>          baseline | contexto-dirigido | mcp-edura | plataforma-completa
 *   --platform <p>         claude-code | codex | antigravity | local-sim
 *   --scenario <id>        ID del escenario (ej: BEN-MEC-001)
 *   --suite <nombre>       local | mecanicos | backends | todos
 *   --repetitions <n>      Número de repeticiones (default: del escenario)
 *   --max-tokens <n>       Límite de tokens (override)
 *   --max-cost <n>         Límite de costo USD (override)
 *   --json                 Salida en JSON
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');

const SCENARIOS_DIR = join(ROOT, '.ai/benchmarks/scenarios');
const RUNS_DIR = join(ROOT, '.ai/benchmarks/runs');
const BASELINES_DIR = join(ROOT, '.ai/benchmarks/baselines');
const CONFIG_PATH = join(ROOT, '.ai/benchmarks/config.yaml');
const THRESHOLDS_PATH = join(ROOT, '.ai/benchmarks/thresholds.yaml');

const args = process.argv.slice(2);
const subcomando = args[0];

const FLAG_DRY_RUN = args.includes('--dry-run');
const FLAG_PAID = args.includes('--paid');
const FLAG_JSON = args.includes('--json');

const getArg = (flag, def = null) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};

const scenarioId = getArg('--scenario');
const suite = getArg('--suite');
const modoOverride = getArg('--mode');
const platformOverride = getArg('--platform', 'local-sim');
const maxTokensOverride = getArg('--max-tokens');
const maxCostOverride = getArg('--max-cost');
const repetitionsOverride = getArg('--repetitions');

// ── Seguridad: redactar contenido sensible ─────────────────────────────────

const PATRONES_SENSIBLES = [
  /password\s*[:=]\s*\S+/gi,
  /secret\s*[:=]\s*\S+/gi,
  /token\s*[:=]\s*\S+/gi,
  /apikey\s*[:=]\s*\S+/gi,
  /api_key\s*[:=]\s*\S+/gi,
  /postgresql?:\/\/[^\s"']+/gi,
  /ghp_[A-Za-z0-9]+/g,
  /sk-[A-Za-z0-9]+/g,
];

function redactar(texto) {
  if (typeof texto !== 'string') return texto;
  let r = texto;
  PATRONES_SENSIBLES.forEach(p => { r = r.replace(p, '[REDACTADO]'); });
  return r;
}

// ── YAML simple parser (sin dependencias) ──────────────────────────────────

function parseYamlSimple(contenido) {
  const lineas = contenido.split('\n');
  const obj = {};
  let currentKey = null;
  let currentArray = null;
  let inArray = false;

  for (const linea of lineas) {
    const stripped = linea.trim();
    if (!stripped || stripped.startsWith('#')) continue;

    if (stripped.startsWith('- ') && inArray && currentArray !== null) {
      const val = stripped.slice(2).trim().replace(/^["']|["']$/g, '');
      obj[currentKey].push(val);
      continue;
    }

    const colonIdx = stripped.indexOf(':');
    if (colonIdx === -1) continue;

    const key = stripped.slice(0, colonIdx).trim();
    const val = stripped.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');

    if (val === '' || val === null) {
      obj[key] = [];
      currentKey = key;
      currentArray = key;
      inArray = true;
    } else {
      obj[key] = val;
      inArray = false;
      currentArray = null;
    }
  }
  return obj;
}

// ── Cargar escenario ────────────────────────────────────────────────────────

function cargarEscenario(id) {
  const ruta = join(SCENARIOS_DIR, `${id}.yaml`);
  if (!existsSync(ruta)) {
    console.error(`Escenario no encontrado: ${id} (${ruta})`);
    process.exit(1);
  }
  return { ruta, contenido: readFileSync(ruta, 'utf8'), parsed: parseYamlSimple(readFileSync(ruta, 'utf8')) };
}

function listarEscenarios() {
  if (!existsSync(SCENARIOS_DIR)) return [];
  return readdirSync(SCENARIOS_DIR)
    .filter(f => f.endsWith('.yaml'))
    .map(f => basename(f, '.yaml'));
}

// ── Validación de escenarios ────────────────────────────────────────────────

function validarEscenario(id, contenido) {
  const errores = [];
  const parsed = parseYamlSimple(contenido);

  if (!parsed.id) errores.push('Falta campo: id');
  if (!parsed.nombre) errores.push('Falta campo: nombre');
  if (!parsed.categoria) errores.push('Falta campo: categoria');
  if (!parsed.riesgo) errores.push('Falta campo: riesgo');
  if (!parsed.objetivo) errores.push('Falta campo: objetivo');
  if (!parsed.presupuesto) errores.push('Falta campo: presupuesto');

  const categoriasValidas = ['mecanico', 'backend', 'frontend', 'database', 'auditoria', 'documentacion', 'log', 'mcp-externo', 'skills', 'subagentes'];
  if (parsed.categoria && !categoriasValidas.includes(parsed.categoria)) {
    errores.push(`Categoría inválida: ${parsed.categoria}`);
  }

  if (parsed.id && parsed.id !== id) {
    errores.push(`ID en archivo (${parsed.id}) no coincide con nombre de archivo (${id})`);
  }

  return { id, valido: errores.length === 0, errores };
}

// ── Generador de Run ID ─────────────────────────────────────────────────────

function generarRunId() {
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0, 10).replace(/-/g, '-');
  const sufijo = createHash('sha256')
    .update(`${Date.now()}${Math.random()}`)
    .digest('hex')
    .slice(0, 4)
    .toUpperCase();
  return `BEN-RUN-${fecha}-${sufijo}`;
}

// ── Snapshot del entorno ────────────────────────────────────────────────────

function capturarEntorno() {
  const env = {
    node_version: process.version,
    os: `${process.platform} ${process.arch}`,
    commit_inicial: null,
    agente_version: null,
    modelo: 'desconocido',
    nivel_esfuerzo: 'auto',
    cache_estado: 'desconocido',
    skills_activas: [],
    mcp_activos: [],
  };

  try {
    env.commit_inicial = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8', timeout: 3000 }).trim();
  } catch { env.commit_inicial = 'no_disponible'; }

  try {
    const v = execSync('codex --version', { encoding: 'utf8', timeout: 3000 }).trim();
    env.agente_version = v;
    env.modelo = 'gpt-5.4-mini';
  } catch { /* no disponible */ }

  return env;
}

// ── Verificar repo limpio ───────────────────────────────────────────────────

function verificarRepoLimpio() {
  try {
    const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim();
    if (status) {
      return { limpio: false, cambios: status.split('\n').slice(0, 5) };
    }
    return { limpio: true, cambios: [] };
  } catch {
    return { limpio: false, cambios: ['No se pudo verificar estado git'] };
  }
}

// ── Plan de ejecución ───────────────────────────────────────────────────────

function generarPlan(escenario, modo, plataforma) {
  const parsed = escenario.parsed;
  const presupuesto = {
    tokens_maximos: maxTokensOverride ? Number(maxTokensOverride) : 50000,
    costo_maximo_usd: maxCostOverride ? Number(maxCostOverride) : 2.0,
    tiempo_maximo_segundos: 600,
  };

  return {
    run_id: generarRunId(),
    scenario_id: parsed.id || escenario.ruta,
    plataforma,
    modo,
    entorno: capturarEntorno(),
    pasos: [
      { paso: 1, nombre: 'Verificar repositorio limpio' },
      { paso: 2, nombre: 'Aplicar fixture (si existe)' },
      { paso: 3, nombre: 'Generar cápsula de contexto' },
      { paso: 4, nombre: 'Activar perfil y modo' },
      { paso: 5, nombre: FLAG_DRY_RUN ? '[DRY-RUN] Simular ejecución del agente' : 'Ejecutar agente' },
      { paso: 6, nombre: 'Capturar eventos de métricas' },
      { paso: 7, nombre: 'Ejecutar validaciones del escenario' },
      { paso: 8, nombre: 'Evaluar calidad con rúbrica' },
      { paso: 9, nombre: 'Guardar diff y resultado' },
      { paso: 10, nombre: 'Restaurar entorno' },
    ],
    presupuesto_efectivo: presupuesto,
    requiere_paid: !FLAG_DRY_RUN && plataforma !== 'local-sim',
    advertencias: [],
  };
}

// ── Ejecución simulada (dry-run / local-sim) ────────────────────────────────

function ejecutarSimulado(plan, escenario) {
  const inicio = Date.now();
  console.log(`\n[DRY-RUN] Simulando ejecución: ${plan.scenario_id}`);
  console.log(`  Modo     : ${plan.modo}`);
  console.log(`  Plataforma: ${plan.plataforma}`);

  // Simular métricas locales (leer fixture si existe)
  const fixturePath = join(ROOT, `.ai/benchmarks/fixtures/${plan.scenario_id}`);
  const fixtureExiste = existsSync(fixturePath);

  const metricasSimuladas = {
    tokens: { disponible: false, fuente: 'simulacion', nota: 'dry-run — sin LLM' },
    costo: { calculado: false, total_usd: 'no_calculado', nota: 'sin ejecución real' },
    contexto: {
      archivos_abiertos: modoOverride === 'baseline' ? 12 : 4,
      archivos_unicos: modoOverride === 'baseline' ? 10 : 3,
      archivos_repetidos: modoOverride === 'baseline' ? 2 : 1,
      lineas_leidas: modoOverride === 'baseline' ? 450 : 120,
      bytes_leidos: modoOverride === 'baseline' ? 18000 : 4800,
      documentos_cargados: 1,
      nota: 'Valores simulados para validación de infraestructura',
    },
    herramientas: {
      expuestas: plan.modo === 'mcp-edura' ? 14 : 5,
      llamadas_total: modoOverride === 'baseline' ? 18 : 6,
      llamadas_utiles: modoOverride === 'baseline' ? 12 : 5,
      llamadas_sin_resultado: modoOverride === 'baseline' ? 6 : 1,
      reintentos: 0,
      mcp_llamadas: plan.modo === 'mcp-edura' ? 4 : 0,
      mcp_errores: 0,
    },
    skills: { disponibles: 20, cargadas: plan.modo === 'plataforma-completa' ? 3 : 0, utilizadas: plan.modo === 'plataforma-completa' ? 2 : 0 },
    ejecucion: {
      duracion_total_ms: Date.now() - inicio,
      intentos: 1,
      correcciones: 0,
      archivos_modificados: 1,
    },
  };

  const resultado = {
    exito_tecnico: true,
    criterios_cumplidos: escenario.parsed.criterios_aceptacion?.length || 3,
    criterios_totales: escenario.parsed.criterios_aceptacion?.length || 3,
    lint: 'no_ejecutado',
    typecheck: 'no_ejecutado',
    pruebas: 'no_ejecutado',
    cambios_fuera_alcance: 0,
    secretos_detectados: 0,
    regresiones: 0,
    calidad_total: null,
    aceptada: null,
    nota: 'Ejecución simulada. Calidad no evaluable sin agente real.',
  };

  const run = {
    run_id: plan.run_id,
    scenario_id: plan.scenario_id,
    plataforma: plan.plataforma,
    modo: plan.modo,
    repeticion: 0,
    inicio: new Date(inicio).toISOString(),
    fin: new Date().toISOString(),
    duracion_ms: Date.now() - inicio,
    estado: 'simulado',
    entorno: plan.entorno,
    metricas: metricasSimuladas,
    resultado,
    diff_path: null,
    log_path: null,
    errores: [],
    fixture_aplicado: fixtureExiste,
  };

  return run;
}

// ── Persistir resultado ─────────────────────────────────────────────────────

function persistirRun(run) {
  mkdirSync(RUNS_DIR, { recursive: true });
  const ruta = join(RUNS_DIR, `${run.run_id}.json`);
  const contenido = JSON.stringify(run, null, 2);
  writeFileSync(ruta, redactar(contenido), 'utf8');
  return ruta;
}

// ── Métricas derivadas ──────────────────────────────────────────────────────

function calcularMetricasDerivadas(metricas) {
  const c = metricas.contexto || {};
  const h = metricas.herramientas || {};
  const s = metricas.skills || {};
  const e = metricas.ejecucion || {};

  const div = (a, b) => (b && b > 0) ? (a / b) : 'no_aplicable';

  return {
    eficiencia_contexto: div(e.archivos_modificados, c.archivos_abiertos),
    precision_lectura: 'no_disponible_sin_agente_real',
    eficiencia_herramientas: div(h.llamadas_utiles, h.llamadas_total),
    eficiencia_skills: div(s.utilizadas, s.cargadas),
    tokens_por_archivo_modificado: 'no_disponible_sin_tokens',
    desperdicio_contexto: 'no_disponible_sin_agente_real',
    sobrecarga_mcp: div(h.mcp_llamadas, h.llamadas_total),
  };
}

// ── Crear baseline ──────────────────────────────────────────────────────────

function crearBaseline(id, run) {
  mkdirSync(BASELINES_DIR, { recursive: true });
  const baselinePath = join(BASELINES_DIR, `${id}.baseline.json`);
  const baseline = {
    scenario_id: id,
    creado: new Date().toISOString(),
    run_id_fuente: run.run_id,
    modo: run.modo,
    plataforma: run.plataforma,
    metricas_referencia: run.metricas,
    calidad_referencia: run.resultado?.calidad_total ?? null,
    nota: run.estado === 'simulado' ? 'Baseline simulado — reemplazar con ejecución real cuando esté disponible' : 'Baseline de ejecución real',
  };
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2), 'utf8');
  return baselinePath;
}

function verificarBaseline(id) {
  const baselinePath = join(BASELINES_DIR, `${id}.baseline.json`);
  if (!existsSync(baselinePath)) {
    return { existe: false, mensaje: `Sin baseline para ${id}. Ejecutar: pnpm ai:benchmark:baseline:create` };
  }
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  return { existe: true, baseline, mensaje: `Baseline encontrado: ${baseline.run_id_fuente}` };
}

// ── Comandos ────────────────────────────────────────────────────────────────

function cmdList() {
  const escenarios = listarEscenarios();
  if (FLAG_JSON) { console.log(JSON.stringify(escenarios)); return; }
  console.log(`\nEscenarios disponibles (${escenarios.length}):\n`);
  escenarios.forEach(id => {
    const parsed = parseYamlSimple(readFileSync(join(SCENARIOS_DIR, `${id}.yaml`), 'utf8'));
    const baseline = existsSync(join(BASELINES_DIR, `${id}.baseline.json`));
    console.log(`  ${id.padEnd(25)} ${(parsed.categoria || '?').padEnd(15)} ${(parsed.riesgo || '?').padEnd(8)} ${baseline ? '[baseline]' : ''}`);
  });
  console.log('');
}

function cmdValidate() {
  const ids = scenarioId ? [scenarioId] : listarEscenarios();
  let errores = 0;

  console.log(`\nValidando ${ids.length} escenario(s)...\n`);

  ids.forEach(id => {
    const ruta = join(SCENARIOS_DIR, `${id}.yaml`);
    if (!existsSync(ruta)) { console.log(`  ✗ ${id} — archivo no encontrado`); errores++; return; }
    const resultado = validarEscenario(id, readFileSync(ruta, 'utf8'));
    if (resultado.valido) {
      console.log(`  ✓ ${id}`);
    } else {
      console.log(`  ✗ ${id}:`);
      resultado.errores.forEach(e => console.log(`      - ${e}`));
      errores++;
    }
  });

  console.log(`\n${errores === 0 ? '✓ Todos válidos' : `✗ ${errores} con errores`}\n`);
  if (errores > 0) process.exit(1);
}

function cmdPlan() {
  if (!scenarioId) { console.error('Uso: --scenario <id>'); process.exit(1); }
  const esc = cargarEscenario(scenarioId);
  const modo = modoOverride || 'plataforma-completa';
  const plan = generarPlan(esc, modo, platformOverride);

  if (FLAG_JSON) { console.log(JSON.stringify(plan, null, 2)); return; }

  console.log(`\nPlan de ejecución: ${scenarioId}\n`);
  console.log(`  Run ID    : ${plan.run_id}`);
  console.log(`  Modo      : ${plan.modo}`);
  console.log(`  Plataforma: ${plan.plataforma}`);
  console.log(`  Presupuesto:`);
  console.log(`    Tokens  : ${plan.presupuesto_efectivo.tokens_maximos.toLocaleString()}`);
  console.log(`    Costo   : $${plan.presupuesto_efectivo.costo_maximo_usd} USD`);
  console.log(`  Pasos:`);
  plan.pasos.forEach(p => console.log(`    ${p.paso}. ${p.nombre}`));

  if (plan.requiere_paid) {
    console.log('\n  ⚠ Esta ejecución consume tokens de pago. Agregar --paid para ejecutar.\n');
  } else {
    console.log('\n  Sin costo de API (dry-run o local-sim).\n');
  }
}

function cmdRun() {
  if (!scenarioId && !suite) { console.error('Uso: --scenario <id> o --suite <nombre>'); process.exit(1); }

  const ids = suite ? obtenerSuite(suite) : [scenarioId];

  ids.forEach(id => {
    const esc = cargarEscenario(id);
    const modo = modoOverride || 'plataforma-completa';
    const plan = generarPlan(esc, modo, platformOverride);

    console.log(`\nEjecutando: ${id} [${modo}] [${platformOverride}]`);

    if (plan.requiere_paid && !FLAG_PAID) {
      console.log('  ⚠ Benchmark externo requiere --paid. Mostrando plan sin ejecutar.\n');
      console.log(`  Tokens estimados máximos: ${plan.presupuesto_efectivo.tokens_maximos.toLocaleString()}`);
      console.log(`  Costo estimado máximo   : $${plan.presupuesto_efectivo.costo_maximo_usd} USD`);
      console.log('  Para ejecutar agregar --paid al comando.\n');
      return;
    }

    // Solo ejecución simulada disponible en modo dry-run o local-sim
    if (FLAG_DRY_RUN || platformOverride === 'local-sim') {
      const run = ejecutarSimulado(plan, esc);
      run.metricas_derivadas = calcularMetricasDerivadas(run.metricas);
      const rutaGuardada = persistirRun(run);

      if (FLAG_JSON) { console.log(JSON.stringify(run, null, 2)); return; }

      console.log(`  ✓ Simulación completada`);
      console.log(`  Run ID    : ${run.run_id}`);
      console.log(`  Estado    : ${run.estado}`);
      console.log(`  Archivos  : ${run.metricas.contexto.archivos_abiertos} abiertos`);
      console.log(`  Llamadas  : ${run.metricas.herramientas.llamadas_total} herramientas`);
      console.log(`  MCP       : ${run.metricas.herramientas.mcp_llamadas} llamadas`);
      console.log(`  Resultado : ${rutaGuardada}`);
      console.log('  Calidad   : no evaluable sin agente real\n');
    } else {
      console.log('  ⚠ Ejecución real con agente no implementada en esta versión.');
      console.log('  Los adaptadores de plataforma (capturarClaude, capturarCodex) están en benchmark-capture.mjs');
      console.log('  Usar --dry-run para simulación o --platform local-sim\n');
    }
  });
}

function obtenerSuite(nombre) {
  const todos = listarEscenarios();
  const suites = {
    'local': todos.filter(id => {
      const p = parseYamlSimple(readFileSync(join(SCENARIOS_DIR, `${id}.yaml`), 'utf8'));
      return ['mecanico', 'log'].includes(p.categoria);
    }),
    'mecanicos': todos.filter(id => parseYamlSimple(readFileSync(join(SCENARIOS_DIR, `${id}.yaml`), 'utf8')).categoria === 'mecanico'),
    'backends': todos.filter(id => parseYamlSimple(readFileSync(join(SCENARIOS_DIR, `${id}.yaml`), 'utf8')).categoria === 'backend'),
    'todos': todos,
  };
  if (!suites[nombre]) { console.error(`Suite desconocida: ${nombre}. Opciones: local, mecanicos, backends, todos`); process.exit(1); }
  return suites[nombre];
}

function cmdBaselineCreate() {
  const ids = scenarioId ? [scenarioId] : listarEscenarios();
  ids.forEach(id => {
    const esc = cargarEscenario(id);
    const plan = generarPlan(esc, 'plataforma-completa', 'local-sim');
    const run = ejecutarSimulado(plan, esc);
    const ruta = crearBaseline(id, run);
    console.log(`  ✓ Baseline creado: ${ruta} (simulado — reemplazar con ejecución real)`);
  });
}

function cmdBaselineCheck() {
  const ids = scenarioId ? [scenarioId] : listarEscenarios();
  let faltantes = 0;
  console.log(`\nVerificando baselines (${ids.length} escenarios):\n`);
  ids.forEach(id => {
    const r = verificarBaseline(id);
    console.log(`  ${r.existe ? '✓' : '○'} ${id.padEnd(25)} ${r.mensaje}`);
    if (!r.existe) faltantes++;
  });
  if (faltantes > 0) {
    console.log(`\n  ${faltantes} sin baseline. Ejecutar: pnpm ai:benchmark:baseline:create\n`);
  } else {
    console.log('\n  Todos los escenarios tienen baseline.\n');
  }
}

// ── Dispatch ─────────────────────────────────────────────────────────────────

switch (subcomando) {
  case 'list':             cmdList(); break;
  case 'validate':         cmdValidate(); break;
  case 'plan':             cmdPlan(); break;
  case 'run':              cmdRun(); break;
  case 'baseline-create':  cmdBaselineCreate(); break;
  case 'baseline-check':   cmdBaselineCheck(); break;
  default:
    console.error(`\nSubcomando desconocido: ${subcomando || '(ninguno)'}`);
    console.error('Uso: node scripts/ai/benchmark-runner.mjs <list|validate|plan|run|baseline-create|baseline-check>');
    process.exit(1);
}
