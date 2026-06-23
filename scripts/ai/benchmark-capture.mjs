#!/usr/bin/env node
/**
 * Captura de métricas por plataforma para benchmarks EDURA.
 * Cada adaptador declara qué métricas puede y no puede proveer.
 *
 * Formato de eventos NDJSON:
 * {"timestamp":"","runId":"","scenarioId":"","platform":"","event":"","tool":"","durationMs":0,"inputSize":0,"outputSize":0,"success":true}
 */

import { writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const RUNS_DIR = join(ROOT, '.ai/benchmarks/runs');

// ── Redactor de seguridad ───────────────────────────────────────────────────

const PATRONES = [
  /password\s*[:=]\s*\S+/gi, /secret\s*[:=]\s*\S+/gi,
  /token\s*[:=]\s*\S+/gi, /apikey\s*[:=]\s*\S+/gi,
  /postgresql?:\/\/[^\s"']+/gi, /ghp_[A-Za-z0-9]+/g, /sk-[A-Za-z0-9]+/g,
];

function redactar(obj) {
  const str = JSON.stringify(obj);
  let r = str;
  PATRONES.forEach(p => { r = r.replace(p, '"[REDACTADO]"'); });
  return JSON.parse(r);
}

// ── Emisor de eventos ───────────────────────────────────────────────────────

function emitirEvento(runId, scenarioId, platform, evento) {
  const logPath = join(RUNS_DIR, `${runId}.events.ndjson`);
  mkdirSync(RUNS_DIR, { recursive: true });

  const entrada = {
    timestamp: new Date().toISOString(),
    runId,
    scenarioId,
    platform,
    event: evento.event,
    tool: evento.tool || null,
    durationMs: evento.durationMs || 0,
    inputSize: evento.inputSize || 0,
    outputSize: evento.outputSize || 0,
    success: evento.success !== undefined ? evento.success : true,
    metadata: evento.metadata ? redactar(evento.metadata) : null,
  };

  appendFileSync(logPath, JSON.stringify(entrada) + '\n', 'utf8');
  return entrada;
}

// ── MÉTRICAS DISPONIBLES POR PLATAFORMA ────────────────────────────────────

export const CAPACIDADES_PLATAFORMA = {
  'claude-code': {
    disponibles: ['archivos_abiertos', 'herramientas_llamadas', 'duracion_ms', 'resultado', 'diff'],
    no_disponibles: ['tokens_entrada', 'tokens_salida', 'costo_usd'],
    fuente: 'logs de sesión + hooks de herramientas',
    precision: 'media',
    limitaciones: 'Tokens disponibles post-sesión via uso API, no en tiempo real desde CLI.',
  },
  'codex': {
    disponibles: ['herramientas_llamadas', 'duracion_ms', 'resultado', 'mcp_llamadas'],
    no_disponibles: ['tokens_entrada', 'tokens_salida', 'costo_usd'],
    proxies: ['bytes_entrada', 'bytes_salida', 'lineas_leidas'],
    fuente: 'stdout/stderr del CLI + eventos MCP',
    precision: 'baja-media',
    limitaciones: 'Codex no expone tokens via CLI. Usar bytes/líneas como proxy. No mezclar con tokens reales.',
  },
  'antigravity': {
    disponibles: [],
    no_disponibles: ['todo'],
    fuente: 'pendiente — plataforma no detectada',
    precision: 'no_disponible',
    limitaciones: 'Antigravity no detectado. Todas las métricas pendientes.',
  },
  'local-sim': {
    disponibles: ['archivos_abiertos', 'lineas_leidas', 'bytes_leidos', 'duracion_ms', 'llamadas_herramientas', 'resultado_deterministico'],
    no_disponibles: ['tokens', 'costo', 'calidad_funcional_real'],
    fuente: 'instrumentación directa de scripts/ai/*.mjs',
    precision: 'alta (para métricas disponibles)',
    limitaciones: 'Sin LLM. La calidad funcional no puede evaluarse en modo simulación.',
  },
};

// ── Adaptadores ─────────────────────────────────────────────────────────────

/**
 * Captura Claude Code — métricas disponibles desde logs de sesión.
 * Los tokens reales requieren acceso a la API Anthropic post-sesión.
 */
export function capturarClaude(runId, scenarioId, opcion = {}) {
  const cap = CAPACIDADES_PLATAFORMA['claude-code'];
  return {
    plataforma: 'claude-code',
    metricas_disponibles: cap.disponibles,
    metricas_no_disponibles: cap.no_disponibles,
    precision: cap.precision,
    limitaciones: cap.limitaciones,
    tokens: { disponible: false, nota: 'Requiere acceso API Anthropic post-sesión o uso de hooks de sesión' },
    costo: { calculado: false, nota: 'No disponible sin tokens' },
    emitir: (ev) => emitirEvento(runId, scenarioId, 'claude-code', ev),
  };
}

/**
 * Captura Codex — usa bytes/líneas como proxy de tokens.
 */
export function capturarCodex(runId, scenarioId, opcion = {}) {
  const cap = CAPACIDADES_PLATAFORMA['codex'];
  return {
    plataforma: 'codex',
    metricas_disponibles: cap.disponibles,
    metricas_no_disponibles: cap.no_disponibles,
    proxies: cap.proxies,
    precision: cap.precision,
    limitaciones: cap.limitaciones,
    tokens: {
      disponible: false,
      proxy_bytes_entrada: null,
      proxy_bytes_salida: null,
      nota: 'Codex CLI no expone tokens. Usar bytes como proxy. NO mezclar con métricas de tokens reales.',
    },
    costo: { calculado: false, nota: 'No disponible sin tokens' },
    emitir: (ev) => emitirEvento(runId, scenarioId, 'codex', ev),
  };
}

/**
 * Captura Antigravity — stub hasta que esté disponible.
 */
export function capturarAntigravity(runId, scenarioId, opcion = {}) {
  const cap = CAPACIDADES_PLATAFORMA['antigravity'];
  return {
    plataforma: 'antigravity',
    estado: 'no_detectado',
    metricas_disponibles: cap.disponibles,
    metricas_no_disponibles: cap.no_disponibles,
    limitaciones: cap.limitaciones,
    tokens: { disponible: false, nota: 'Plataforma no detectada' },
    costo: { calculado: false, nota: 'Plataforma no detectada' },
    emitir: () => { /* no-op */ },
  };
}

/**
 * Captura modo local/simulación — instrumentación directa.
 */
export function capturarLocal(runId, scenarioId, opcion = {}) {
  const cap = CAPACIDADES_PLATAFORMA['local-sim'];
  const inicio = Date.now();
  const contadores = {
    archivos_abiertos: 0, lineas_leidas: 0, bytes_leidos: 0,
    llamadas_herramientas: 0, mcp_llamadas: 0, mcp_errores: 0,
    herramientas_utiles: 0,
  };

  return {
    plataforma: 'local-sim',
    metricas_disponibles: cap.disponibles,
    metricas_no_disponibles: cap.no_disponibles,
    limitaciones: cap.limitaciones,
    tokens: { disponible: false, nota: 'Simulación — sin LLM' },
    costo: { calculado: false, total_usd: 0, nota: 'Sin costo en modo simulación' },

    registrarLectura(ruta, lineas, bytes) {
      contadores.archivos_abiertos++;
      contadores.lineas_leidas += lineas || 0;
      contadores.bytes_leidos += bytes || 0;
      emitirEvento(runId, scenarioId, 'local-sim', {
        event: 'tool_read', tool: 'Read', durationMs: 0,
        inputSize: ruta.length, outputSize: bytes || 0, success: true,
        metadata: { ruta, lineas },
      });
    },

    registrarHerramienta(nombre, exito, durationMs = 0, outputBytes = 0) {
      contadores.llamadas_herramientas++;
      if (exito) contadores.herramientas_utiles++;
      emitirEvento(runId, scenarioId, 'local-sim', {
        event: 'tool_call', tool: nombre, durationMs, outputSize: outputBytes, success: exito,
      });
    },

    registrarMCP(herramienta, exito, durationMs = 0, outputBytes = 0) {
      contadores.mcp_llamadas++;
      if (!exito) contadores.mcp_errores++;
      emitirEvento(runId, scenarioId, 'local-sim', {
        event: 'mcp_call', tool: herramienta, durationMs, outputSize: outputBytes, success: exito,
      });
    },

    obtenerMetricas() {
      return {
        contexto: { ...contadores, duracion_ms: Date.now() - inicio },
        herramientas: {
          expuestas: 5,
          llamadas_total: contadores.llamadas_herramientas + contadores.mcp_llamadas,
          llamadas_utiles: contadores.herramientas_utiles,
          llamadas_sin_resultado: contadores.llamadas_herramientas - contadores.herramientas_utiles,
          reintentos: 0,
          mcp_llamadas: contadores.mcp_llamadas,
          mcp_errores: contadores.mcp_errores,
        },
      };
    },

    emitir: (ev) => emitirEvento(runId, scenarioId, 'local-sim', ev),
  };
}

// ── Seleccionar adaptador según plataforma ──────────────────────────────────

export function obtenerAdaptador(plataforma, runId, scenarioId) {
  const mapa = {
    'claude-code': capturarClaude,
    'codex': capturarCodex,
    'antigravity': capturarAntigravity,
    'local-sim': capturarLocal,
  };
  const fn = mapa[plataforma] || capturarLocal;
  return fn(runId, scenarioId);
}

// ── CLI ──────────────────────────────────────────────────────────────────────

if (process.argv[2] === 'capacidades') {
  const p = process.argv[3] || 'local-sim';
  const cap = CAPACIDADES_PLATAFORMA[p];
  if (!cap) { console.error(`Plataforma desconocida: ${p}`); process.exit(1); }
  console.log(`\nCapacidades de captura: ${p}\n`);
  console.log(`  Disponibles    : ${cap.disponibles.join(', ') || 'ninguna'}`);
  console.log(`  No disponibles : ${cap.no_disponibles.join(', ')}`);
  console.log(`  Fuente         : ${cap.fuente}`);
  console.log(`  Precisión      : ${cap.precision}`);
  console.log(`  Limitaciones   : ${cap.limitaciones}\n`);
}
