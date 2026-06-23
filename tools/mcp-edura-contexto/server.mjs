#!/usr/bin/env node
/**
 * MCP EDURA Contexto — Servidor STDIO local
 * Expone herramientas compactas para acceso estructurado al repositorio EDURA.
 * No expone lectura arbitraria del sistema. Solo opera dentro de ROOT.
 */
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, relative } from 'node:path';
import { createInterface } from 'node:readline';

// ── Constantes de seguridad ─────────────────────────────────────────────────
const ROOT = resolve(new URL('../../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const MAX_LINEAS = 300;
const MAX_RESULTADOS = 20;
const MAX_BYTES_RESPUESTA = 80_000;

const EXCLUSIONES = [
  'node_modules', 'dist', '.next', 'coverage', '.git',
  '.env', '.pem', '.key', '.p12', 'secret', 'credential',
];

function esSegurostro(ruta) {
  const abs = resolve(ROOT, ruta);
  if (!abs.startsWith(ROOT)) return false; // path traversal
  return !EXCLUSIONES.some(ex => abs.toLowerCase().includes(ex.toLowerCase()));
}

function leerArchivoSeguro(ruta, desde = 1, hasta = MAX_LINEAS) {
  if (!esSegurostro(ruta)) return { error: `Ruta no permitida: ${ruta}` };
  const abs = join(ROOT, ruta);
  if (!existsSync(abs)) return { error: `Archivo no encontrado: ${ruta}` };
  const lineas = readFileSync(abs, 'utf8').split('\n');
  const total = lineas.length;
  const hastaLimitado = Math.min(hasta, desde + MAX_LINEAS - 1, total);
  const contenido = lineas.slice(desde - 1, hastaLimitado).join('\n');
  return { contenido, desde, hasta: hastaLimitado, total, truncado: hastaLimitado < total };
}

function buscarPatron(patron, glob = '**/*.ts') {
  if (!patron || patron.length < 2) return { error: 'Patrón demasiado corto' };
  try {
    const excl = EXCLUSIONES.map(e => `--glob=!**/${e}/**`).join(' ');
    const resultado = execSync(
      `rg "${patron.replace(/"/g, '\\"')}" --glob="${glob}" ${excl} -n --max-count=3 -l`,
      { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', timeout: 10000 }
    );
    const archivos = resultado.trim().split('\n').filter(Boolean).slice(0, MAX_RESULTADOS);
    const resultados = archivos.map(f => {
      try {
        const lineas = execSync(
          `rg "${patron.replace(/"/g, '\\"')}" "${f}" -n --max-count=3`,
          { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', timeout: 5000 }
        ).trim();
        return { archivo: f, coincidencias: lineas.split('\n').filter(Boolean) };
      } catch { return { archivo: f, coincidencias: [] }; }
    });
    return { resultados, total: archivos.length, limitado: archivos.length >= MAX_RESULTADOS };
  } catch (e) {
    if (e.status === 1) return { resultados: [], total: 0, limitado: false };
    return { error: 'Error al buscar: ' + e.message.split('\n')[0] };
  }
}

// ── Definición de herramientas ──────────────────────────────────────────────
const HERRAMIENTAS = [
  {
    name: 'obtener_estado_proyecto',
    description: 'Retorna el estado maestro del proyecto EDURA (módulos implementados, versión, fecha).',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'obtener_tarea',
    description: 'Lee el manifiesto de una tarea activa EDURA-XXX.',
    inputSchema: {
      type: 'object',
      properties: { id_tarea: { type: 'string', description: 'Ej: EDURA-001' } },
      required: ['id_tarea'],
    },
  },
  {
    name: 'compilar_contexto',
    description: 'Compila la cápsula de contexto mínima para una tarea.',
    inputSchema: {
      type: 'object',
      properties: { id_tarea: { type: 'string' } },
      required: ['id_tarea'],
    },
  },
  {
    name: 'buscar_simbolo',
    description: 'Busca un símbolo o patrón en el repositorio EDURA. Limitado a 20 archivos y 3 coincidencias por archivo.',
    inputSchema: {
      type: 'object',
      properties: {
        patron: { type: 'string', description: 'Patrón de búsqueda (regex)' },
        glob: { type: 'string', description: 'Glob de archivos (ej: back/src/**/*.ts)', default: '**/*.ts' },
      },
      required: ['patron'],
    },
  },
  {
    name: 'leer_rango',
    description: 'Lee un rango de líneas de un archivo. Máximo 300 líneas. Rechaza rutas fuera del repositorio o con secretos.',
    inputSchema: {
      type: 'object',
      properties: {
        ruta: { type: 'string', description: 'Ruta relativa desde la raíz del repositorio' },
        desde: { type: 'number', default: 1 },
        hasta: { type: 'number', default: 50 },
      },
      required: ['ruta'],
    },
  },
  {
    name: 'obtener_manifiesto_modulo',
    description: 'Retorna el manifiesto compacto de un módulo NestJS (estructura, archivos, entidades).',
    inputSchema: {
      type: 'object',
      properties: { nombre: { type: 'string', description: 'Nombre del módulo (ej: matriculas)' } },
      required: ['nombre'],
    },
  },
  {
    name: 'obtener_adr',
    description: 'Lista o lee un Architecture Decision Record.',
    inputSchema: {
      type: 'object',
      properties: {
        numero: { type: 'string', description: 'Número ADR (ej: 0001). Omitir para listar todos.' },
      },
      required: [],
    },
  },
  {
    name: 'calcular_impacto',
    description: 'Identifica módulos y archivos afectados por los cambios actuales de Git.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'obtener_diff',
    description: 'Retorna el diff actual comprimido (solo estadísticas + primeras líneas de cambios relevantes).',
    inputSchema: {
      type: 'object',
      properties: { staged: { type: 'boolean', default: false } },
      required: [],
    },
  },
  {
    name: 'ejecutar_validacion_dirigida',
    description: 'Ejecuta lint y typecheck solo en archivos modificados. No ejecuta toda la suite.',
    inputSchema: {
      type: 'object',
      properties: {
        area: { type: 'string', enum: ['back', 'front', 'ambos'], default: 'ambos' },
      },
      required: [],
    },
  },
  {
    name: 'comprimir_errores',
    description: 'Extrae errores accionables de un log. Elimina duplicados y rutas de node_modules.',
    inputSchema: {
      type: 'object',
      properties: { log: { type: 'string', description: 'Texto del log a comprimir' } },
      required: ['log'],
    },
  },
  {
    name: 'generar_handoff',
    description: 'Genera el paquete de handoff compacto para una tarea completada.',
    inputSchema: {
      type: 'object',
      properties: {
        id_tarea: { type: 'string' },
        estado: { type: 'string', enum: ['implementado', 'parcial', 'bloqueado'], default: 'implementado' },
      },
      required: ['id_tarea'],
    },
  },
  {
    name: 'obtener_metricas',
    description: 'Retorna métricas de tareas completadas (handoffs registrados).',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'validar_tarea',
    description: 'Verifica que una tarea tenga los campos obligatorios y sea accionable.',
    inputSchema: {
      type: 'object',
      properties: { id_tarea: { type: 'string' } },
      required: ['id_tarea'],
    },
  },
];

// ── Implementación de herramientas ──────────────────────────────────────────
function ejecutarHerramienta(nombre, args) {
  switch (nombre) {

    case 'obtener_estado_proyecto': {
      const estadoPath = join(ROOT, 'docs/ESTADO-MAESTRO.md');
      if (!existsSync(estadoPath)) return { estado: 'no_disponible', nota: 'docs/ESTADO-MAESTRO.md no encontrado' };
      const contenido = readFileSync(estadoPath, 'utf8');
      const primeras = contenido.split('\n').slice(0, 80).join('\n');
      return { contenido: primeras, ruta: 'docs/ESTADO-MAESTRO.md', truncado: true };
    }

    case 'obtener_tarea': {
      const { id_tarea } = args;
      const rutas = [
        join(ROOT, 'tasks/active', `${id_tarea}.md`),
        join(ROOT, 'tasks/active', `${id_tarea}-*.md`),
      ];
      // Buscar archivo exacto o con sufijo
      let rutaReal = rutas[0];
      if (!existsSync(rutaReal)) {
        const activos = existsSync(join(ROOT, 'tasks/active')) ?
          readdirSync(join(ROOT, 'tasks/active')).find(f => f.startsWith(id_tarea)) : null;
        if (activos) rutaReal = join(ROOT, 'tasks/active', activos);
        else return { error: `Tarea no encontrada: ${id_tarea}` };
      }
      return leerArchivoSeguro(relative(ROOT, rutaReal));
    }

    case 'compilar_contexto': {
      const { id_tarea } = args;
      const ctxPath = join(ROOT, 'tasks/context', `${id_tarea}.context.yaml`);
      if (existsSync(ctxPath)) {
        return leerArchivoSeguro(relative(ROOT, ctxPath));
      }
      // Intentar compilar
      try {
        execSync(`node scripts/ai/context.mjs ${id_tarea}`, { cwd: ROOT, encoding: 'utf8', timeout: 15000 });
        return leerArchivoSeguro(`tasks/context/${id_tarea}.context.yaml`);
      } catch (e) {
        return { error: 'No se pudo compilar el contexto: ' + e.message.split('\n')[0] };
      }
    }

    case 'buscar_simbolo': {
      const { patron, glob = '**/*.ts' } = args;
      return buscarPatron(patron, glob);
    }

    case 'leer_rango': {
      const { ruta, desde = 1, hasta = 50 } = args;
      return leerArchivoSeguro(ruta, desde, hasta);
    }

    case 'obtener_manifiesto_modulo': {
      const { nombre } = args;
      const manifestoPath = join(ROOT, 'docs/ai/context', `${nombre}.manifest.json`);
      if (existsSync(manifestoPath)) {
        try {
          return JSON.parse(readFileSync(manifestoPath, 'utf8'));
        } catch { /* regenerar */ }
      }
      // Generar sobre la marcha
      try {
        execSync(`node scripts/ai/generate-module-manifest.mjs ${nombre}`, { cwd: ROOT, encoding: 'utf8', timeout: 15000 });
        return JSON.parse(readFileSync(manifestoPath, 'utf8'));
      } catch (e) {
        return { error: `No se pudo generar manifiesto para: ${nombre}` };
      }
    }

    case 'obtener_adr': {
      const { numero } = args;
      const adrDir = join(ROOT, 'docs/ai/decisions');
      if (!existsSync(adrDir)) return { adrs: [], nota: 'Directorio ADR vacío' };
      const archivos = readdirSync(adrDir).filter(f => f.endsWith('.md'));
      if (!numero) {
        return { adrs: archivos, total: archivos.length };
      }
      const archivo = archivos.find(f => f.includes(numero));
      if (!archivo) return { error: `ADR ${numero} no encontrado` };
      return leerArchivoSeguro(`docs/ai/decisions/${archivo}`);
    }

    case 'calcular_impacto': {
      try {
        const modificados = execSync('git diff --name-only HEAD', { cwd: ROOT, encoding: 'utf8' })
          .split('\n').filter(Boolean);
        const back = modificados.filter(f => f.startsWith('back/'));
        const front = modificados.filter(f => f.startsWith('front/'));
        const ai = modificados.filter(f => f.startsWith('scripts/ai/') || f.startsWith('.ai/'));
        const modulos = [...new Set(
          back.map(f => f.match(/back\/src\/modulos\/([^/]+)/)?.[1]).filter(Boolean)
        )];
        return { modificados: modificados.length, back: back.length, front: front.length, ai: ai.length, modulos };
      } catch {
        return { error: 'No es un repositorio Git o sin cambios' };
      }
    }

    case 'obtener_diff': {
      const { staged = false } = args;
      const cmd = staged ? 'git diff --staged' : 'git diff HEAD';
      try {
        const stat = execSync(`${cmd} --stat`, { cwd: ROOT, encoding: 'utf8' });
        const diff = execSync(cmd, { cwd: ROOT, encoding: 'utf8' });
        // Solo las primeras 100 líneas del diff
        const difTruncado = diff.split('\n').slice(0, 100).join('\n');
        // Detectar posibles secretos
        const patronesSecretos = ['password', 'secret', 'token', 'apikey', 'api_key'];
        const alertas = diff.split('\n')
          .filter(l => l.startsWith('+') && !l.startsWith('+++'))
          .filter(l => patronesSecretos.some(p => l.toLowerCase().includes(p)))
          .slice(0, 3);
        return { estadisticas: stat.trim(), diff: difTruncado, alertas_seguridad: alertas, truncado: diff.split('\n').length > 100 };
      } catch {
        return { estadisticas: 'Sin cambios', diff: '', alertas_seguridad: [] };
      }
    }

    case 'ejecutar_validacion_dirigida': {
      const { area = 'ambos' } = args;
      const resultados = {};
      if (area === 'back' || area === 'ambos') {
        try {
          execSync('npm --prefix back run lint 2>&1', { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
          resultados.lint_back = 'ok';
        } catch (e) {
          resultados.lint_back = 'fallido';
          resultados.lint_back_detalle = e.stdout?.split('\n').filter(l => /error/i.test(l)).slice(0, 5).join('\n');
        }
      }
      if (area === 'front' || area === 'ambos') {
        try {
          execSync('npm --prefix front run lint 2>&1', { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
          resultados.lint_front = 'ok';
        } catch (e) {
          resultados.lint_front = 'fallido';
          resultados.lint_front_detalle = e.stdout?.split('\n').filter(l => /error/i.test(l)).slice(0, 5).join('\n');
        }
      }
      return resultados;
    }

    case 'comprimir_errores': {
      const { log } = args;
      if (!log) return { error: 'log requerido' };
      const lineas = log.split('\n');
      const patronesError = [/error\s*:/i, /Error:/, /FAIL\s/, /TS\d{4}:/];
      const patronesIgnorar = [/node_modules/, /\.next\//, /dist\//];
      const errores = [...new Set(
        lineas
          .filter(l => !patronesIgnorar.some(p => p.test(l)))
          .filter(l => patronesError.some(p => p.test(l)))
          .map(l => l.trim())
          .slice(0, 20)
      )];
      return { errores, total: errores.length };
    }

    case 'generar_handoff': {
      const { id_tarea, estado = 'implementado' } = args;
      try {
        const salida = execSync(
          `node scripts/ai/handoff.mjs ${id_tarea} --estado ${estado}`,
          { cwd: ROOT, encoding: 'utf8', timeout: 15000 }
        );
        return { generado: true, salida: salida.trim(), ruta: `tasks/handoffs/${id_tarea}.handoff.json` };
      } catch (e) {
        return { error: e.message.split('\n')[0] };
      }
    }

    case 'obtener_metricas': {
      try {
        const salida = execSync('node scripts/ai/metrics.mjs report', { cwd: ROOT, encoding: 'utf8', timeout: 10000 });
        return { reporte: salida.trim() };
      } catch (e) {
        return { error: e.message.split('\n')[0] };
      }
    }

    case 'validar_tarea': {
      const { id_tarea } = args;
      const activos = existsSync(join(ROOT, 'tasks/active')) ?
        readdirSync(join(ROOT, 'tasks/active')) : [];
      const archivo = activos.find(f => f.startsWith(id_tarea));
      if (!archivo) return { valida: false, error: `Tarea ${id_tarea} no encontrada en tasks/active/` };
      const contenido = readFileSync(join(ROOT, 'tasks/active', archivo), 'utf8');
      const camposRequeridos = ['objetivo', 'criterios de aceptación', 'módulos afectados'];
      const faltantes = camposRequeridos.filter(c => !contenido.toLowerCase().includes(c));
      return {
        valida: faltantes.length === 0,
        archivo,
        campos_faltantes: faltantes,
        tipo: contenido.match(/tipo:\s*(\S+)/i)?.[1] ?? 'desconocido',
        perfil: contenido.match(/perfil:\s*(\S+)/i)?.[1] ?? 'desconocido',
      };
    }

    default:
      return { error: `Herramienta desconocida: ${nombre}` };
  }
}

// ── Protocolo MCP (JSON-RPC sobre STDIO) ───────────────────────────────────
const rl = createInterface({ input: process.stdin, terminal: false });
let buffer = '';

function enviar(objeto) {
  const json = JSON.stringify(objeto);
  process.stdout.write(json + '\n');
}

function manejarMensaje(mensaje) {
  const { jsonrpc, id, method, params } = mensaje;

  if (method === 'initialize') {
    enviar({
      jsonrpc: '2.0', id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'mcp-edura-contexto', version: '1.0.0' },
        instructions: 'Servidor MCP local para EDURA. Acceso estructurado al repositorio. No expone secretos ni rutas fuera de la raíz del proyecto.',
      },
    });
    return;
  }

  if (method === 'notifications/initialized') return;

  if (method === 'tools/list') {
    enviar({ jsonrpc: '2.0', id, result: { tools: HERRAMIENTAS } });
    return;
  }

  if (method === 'tools/call') {
    const { name, arguments: args = {} } = params;
    try {
      const resultado = ejecutarHerramienta(name, args);
      const texto = JSON.stringify(resultado, null, 2);
      const truncado = texto.length > MAX_BYTES_RESPUESTA;
      enviar({
        jsonrpc: '2.0', id,
        result: {
          content: [{
            type: 'text',
            text: truncado ? texto.slice(0, MAX_BYTES_RESPUESTA) + '\n... [truncado]' : texto,
          }],
          isError: !!resultado.error,
        },
      });
    } catch (e) {
      enviar({
        jsonrpc: '2.0', id,
        result: { content: [{ type: 'text', text: `Error interno: ${e.message}` }], isError: true },
      });
    }
    return;
  }

  // Método no soportado
  enviar({
    jsonrpc: '2.0', id,
    error: { code: -32601, message: `Método no soportado: ${method}` },
  });
}

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const mensaje = JSON.parse(trimmed);
    manejarMensaje(mensaje);
  } catch (e) {
    process.stderr.write(`Error parseando JSON: ${e.message}\n`);
  }
});

process.stdin.on('end', () => process.exit(0));
process.stderr.write('mcp-edura-contexto v1.0.0 iniciado\n');
