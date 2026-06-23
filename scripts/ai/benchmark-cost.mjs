#!/usr/bin/env node
/**
 * Calculadora de costos de inferencia para benchmarks EDURA.
 * Usa cost-models.yaml. No inventa precios.
 *
 * Uso: node scripts/ai/benchmark-cost.mjs <run_id | --modelo <m> --tokens-entrada <n> --tokens-salida <n>>
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const RUNS_DIR = join(ROOT, '.ai/benchmarks/runs');
const COST_MODELS_PATH = join(ROOT, '.ai/benchmarks/cost-models.yaml');

const args = process.argv.slice(2);
const FLAG_JSON = args.includes('--json');
const getArg = (f, d = null) => { const i = args.indexOf(f); return i !== -1 && args[i + 1] ? args[i + 1] : d; };

// ── Leer modelos de costo ────────────────────────────────────────────────────

function leerCostModels() {
  if (!existsSync(COST_MODELS_PATH)) {
    return { modelos: {}, error: 'cost-models.yaml no encontrado' };
  }
  const raw = readFileSync(COST_MODELS_PATH, 'utf8');

  // Parse básico de YAML de modelos
  const modelos = {};
  let modeloActual = null;
  for (const linea of raw.split('\n')) {
    const stripped = linea.trim();
    if (!stripped || stripped.startsWith('#')) continue;

    // Detectar inicio de modelo (2 espacios de indentación con clave que no tiene prefijo yaml especial)
    const matchModelo = linea.match(/^  ([a-z][a-z0-9._-]+):$/);
    if (matchModelo && raw.includes(`modelos:\n  ${matchModelo[1]}`)) {
      modeloActual = matchModelo[1];
      modelos[modeloActual] = {};
      continue;
    }

    if (modeloActual) {
      const matchProp = linea.match(/^    (\w+):\s*(.+)$/);
      if (matchProp) {
        const val = matchProp[2].trim().replace(/^["']|["']$/g, '');
        modelos[modeloActual][matchProp[1]] = val === 'no_verificado' ? null : isNaN(val) ? val : Number(val);
      }
    }
  }
  return { modelos };
}

// ── Calcular costo ──────────────────────────────────────────────────────────

function calcularCosto(modelo, tokensEntrada, tokensCacheados, tokensSalida) {
  const { modelos } = leerCostModels();
  const m = modelos[modelo];

  if (!m) {
    return { calculado: false, razon: `Modelo desconocido: ${modelo}. Ver .ai/benchmarks/cost-models.yaml`, total_usd: 'no_calculado' };
  }

  if (!m.precio_entrada_por_mtoken || !m.precio_salida_por_mtoken) {
    return { calculado: false, razon: `Precios no verificados para ${modelo}. Ver fuente oficial.`, total_usd: 'no_calculado', modelo };
  }

  const entradaNoCache = Math.max(0, tokensEntrada - (tokensCacheados || 0));
  const costoEntrada = (entradaNoCache / 1_000_000) * m.precio_entrada_por_mtoken;
  const costoCache = ((tokensCacheados || 0) / 1_000_000) * (m.precio_entrada_cacheada_por_mtoken || 0);
  const costoSalida = (tokensSalida / 1_000_000) * m.precio_salida_por_mtoken;
  const total = costoEntrada + costoCache + costoSalida;

  return {
    calculado: true,
    modelo,
    verificado: m.verificado === true || m.verificado === 'true',
    moneda: m.moneda || 'USD',
    tokens_entrada: tokensEntrada,
    tokens_cacheados: tokensCacheados || 0,
    tokens_salida: tokensSalida,
    costo_entrada_usd: Math.round(costoEntrada * 1000000) / 1000000,
    costo_cache_usd: Math.round(costoCache * 1000000) / 1000000,
    costo_salida_usd: Math.round(costoSalida * 1000000) / 1000000,
    total_usd: Math.round(total * 1000000) / 1000000,
    nota: m.nota || '',
    advertencia: m.verificado !== true ? 'Precios de referencia no verificados oficialmente.' : null,
  };
}

// ── Desde run ID ─────────────────────────────────────────────────────────────

function calcularCostoDesdeRun(runId) {
  const candidatos = existsSync(RUNS_DIR)
    ? readdirSync(RUNS_DIR).filter(f => f.startsWith(runId) && f.endsWith('.json'))
    : [];
  if (candidatos.length === 0) { console.error(`Run no encontrado: ${runId}`); process.exit(1); }
  const run = JSON.parse(readFileSync(join(RUNS_DIR, candidatos[0]), 'utf8'));

  const tokensInfo = run.metricas?.tokens;
  if (!tokensInfo?.disponible) {
    return {
      run_id: run.run_id, plataforma: run.plataforma, modelo: run.entorno?.modelo || 'desconocido',
      calculado: false, razon: `Tokens no disponibles para plataforma ${run.plataforma}. ${tokensInfo?.nota || ''}`,
      total_usd: 'no_calculado',
    };
  }

  return calcularCosto(
    run.entorno?.modelo || 'claude-sonnet-4-6',
    tokensInfo.entrada || 0, tokensInfo.entrada_cacheada || 0, tokensInfo.salida || 0,
  );
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const runIdArg = args.find(a => !a.startsWith('-') && a.startsWith('BEN-RUN'));
const modeloArg = getArg('--modelo');
const tokEnt = getArg('--tokens-entrada');
const tokSal = getArg('--tokens-salida');
const tokCache = getArg('--tokens-cacheados', '0');

let resultado;

if (runIdArg) {
  resultado = calcularCostoDesdeRun(runIdArg);
} else if (modeloArg && tokEnt && tokSal) {
  resultado = calcularCosto(modeloArg, Number(tokEnt), Number(tokCache), Number(tokSal));
} else {
  console.log('\nUso:');
  console.log('  node scripts/ai/benchmark-cost.mjs <BEN-RUN-...>');
  console.log('  node scripts/ai/benchmark-cost.mjs --modelo claude-sonnet-4-6 --tokens-entrada 10000 --tokens-salida 2000');
  console.log('\nModelos disponibles:');
  const { modelos } = leerCostModels();
  Object.keys(modelos).forEach(m => console.log(`  ${m}`));
  process.exit(0);
}

if (FLAG_JSON) {
  console.log(JSON.stringify(resultado, null, 2));
} else {
  console.log('\nCálculo de costo de inferencia EDURA\n');
  console.log(`  Modelo        : ${resultado.modelo || 'N/D'}`);
  console.log(`  Calculado     : ${resultado.calculado ? 'Sí' : 'No'}`);
  if (!resultado.calculado) {
    console.log(`  Razón         : ${resultado.razon}`);
    console.log(`  Costo total   : ${resultado.total_usd}`);
  } else {
    console.log(`  Tokens entrada: ${resultado.tokens_entrada?.toLocaleString()}`);
    console.log(`  Tokens caché  : ${resultado.tokens_cacheados?.toLocaleString()}`);
    console.log(`  Tokens salida : ${resultado.tokens_salida?.toLocaleString()}`);
    console.log(`  Costo entrada : $${resultado.costo_entrada_usd} ${resultado.moneda}`);
    console.log(`  Costo caché   : $${resultado.costo_cache_usd} ${resultado.moneda}`);
    console.log(`  Costo salida  : $${resultado.costo_salida_usd} ${resultado.moneda}`);
    console.log(`  TOTAL         : $${resultado.total_usd} ${resultado.moneda}`);
    if (resultado.advertencia) console.log(`\n  ⚠ ${resultado.advertencia}`);
    if (resultado.nota) console.log(`  Nota: ${resultado.nota}`);
  }
  console.log('');
}

export { calcularCosto, leerCostModels };
