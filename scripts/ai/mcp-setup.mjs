#!/usr/bin/env node
/**
 * Setup asistido de MCP para EDURA.
 * Genera un plan por servidor basado en preguntas mínimas sobre el entorno.
 * No solicita secretos — solo detecta qué existe y qué falta.
 *
 * Uso: node scripts/ai/mcp-setup.mjs [--non-interactive] [--json]
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const FLAG_JSON = process.argv.includes('--json');
const FLAG_NON_INTERACTIVE = process.argv.includes('--non-interactive');

// ── I/O ─────────────────────────────────────────────────────────────────────

const rl = FLAG_NON_INTERACTIVE
  ? null
  : createInterface({ input: process.stdin, output: process.stdout });

function preguntar(pregunta, opciones = null, porDefecto = null) {
  if (FLAG_NON_INTERACTIVE) return Promise.resolve(porDefecto ?? (opciones ? opciones[0] : 's'));

  return new Promise(resolve => {
    const sufijo = opciones
      ? ` [${opciones.join('/')}]${porDefecto ? ` (${porDefecto})` : ''}: `
      : porDefecto
        ? ` (${porDefecto}): `
        : ': ';
    rl.question(`\n  ${pregunta}${sufijo}`, answer => {
      const r = answer.trim() || porDefecto || '';
      if (opciones && !opciones.includes(r.toLowerCase())) {
        resolve(opciones[0]);
      } else {
        resolve(r.toLowerCase() || porDefecto || opciones?.[0] || '');
      }
    });
  });
}

function log(msg = '') { process.stdout.write(msg + '\n'); }
function sep(char = '─', n = 60) { log(char.repeat(n)); }

// ── Detección automática ─────────────────────────────────────────────────────

function detectarEntorno() {
  const env = {};

  const detectarCmd = (nombre, cmd) => {
    try {
      return execSync(cmd, { encoding: 'utf8', timeout: 4000, stdio: 'pipe' }).trim().split('\n')[0];
    } catch { return null; }
  };

  env.claude = detectarCmd('claude', 'claude --version');
  env.codex = detectarCmd('codex', 'codex --version');
  env.antigravity = detectarCmd('antigravity', 'antigravity --version');
  env.node = detectarCmd('node', 'node --version');
  env.rg = detectarCmd('rg', 'rg --version');
  env.npx = detectarCmd('npx', 'npx --version');
  env.gcloud = detectarCmd('gcloud', 'gcloud --version');

  env.POSTGRES_MCP_URL = !!process.env.POSTGRES_MCP_URL;
  env.GITHUB_TOKEN = !!process.env.GITHUB_TOKEN;
  env.GOOGLE_CLOUD_PROJECT = !!process.env.GOOGLE_CLOUD_PROJECT;
  env.STITCH_API_KEY = !!process.env.STITCH_API_KEY;

  env.mcpJsonExiste = existsSync(join(ROOT, '.mcp.json'));
  env.serverMjsExiste = existsSync(join(ROOT, 'tools/mcp-edura-contexto/server.mjs'));
  env.codexConfigExiste = existsSync(join(process.env.USERPROFILE || process.env.HOME || '', '.codex/config.toml'));

  return env;
}

// ── Generador de plan ────────────────────────────────────────────────────────

function generarPlan(env, respuestas) {
  const plan = {
    generado: new Date().toISOString().split('T')[0],
    plataformas_detectadas: [],
    plataformas_usara: [],
    servidores: [],
  };

  if (env.claude) plan.plataformas_detectadas.push('claude-code');
  if (env.codex) plan.plataformas_detectadas.push('codex');
  if (env.antigravity) plan.plataformas_detectadas.push('antigravity');

  plan.plataformas_usara = respuestas.plataformas;

  // ── edura-contexto ──────────────────────────────────────────────────────
  {
    const acciones = [];
    let estado = 'listo';

    if (!env.serverMjsExiste) {
      acciones.push({ paso: 'MANUAL', instruccion: 'El servidor MCP no fue encontrado. Verificar rama y git status.' });
      estado = 'bloqueado';
    } else if (!env.mcpJsonExiste && plan.plataformas_usara.includes('claude-code')) {
      acciones.push({ paso: 'AUTO', instruccion: 'Crear .mcp.json en la raíz. Ejecutar: node scripts/ai/mcp-manager.mjs generate-configs' });
      estado = 'pendiente_config';
    } else {
      acciones.push({ paso: 'INFO', instruccion: 'Servidor instalado y .mcp.json presente. Verificar con: node scripts/ai/mcp-manager.mjs test edura-contexto' });
    }

    if (plan.plataformas_usara.includes('codex') && env.codex && env.codexConfigExiste) {
      const configContent = readFileSync(join(process.env.USERPROFILE || process.env.HOME || '', '.codex/config.toml'), 'utf8');
      if (!configContent.includes('[mcp_servers.edura-contexto]')) {
        acciones.push({
          paso: 'MANUAL',
          instruccion: `Ejecutar en terminal: codex mcp add --name edura-contexto --transport stdio "node ${join(ROOT, 'tools/mcp-edura-contexto/server.mjs').replace(/\\/g, '/')}"`,
        });
      } else {
        acciones.push({ paso: 'INFO', instruccion: 'edura-contexto ya registrado en Codex config.toml' });
      }
    }

    plan.servidores.push({ id: 'edura-contexto', estado, perfiles: ['todos'], acciones });
  }

  // ── playwright ──────────────────────────────────────────────────────────
  if (respuestas.usarPlaywright === 's') {
    const acciones = [];

    if (!env.npx) {
      acciones.push({ paso: 'BLOQUEADO', instruccion: 'npx no encontrado. Instalar Node.js >=18 primero.' });
    } else {
      acciones.push({ paso: 'INFO', instruccion: '.mcp.json ya incluye playwright. Aprobar en Claude Code: /mcp → playwright → aprobar' });
      if (plan.plataformas_usara.includes('codex') && env.codex) {
        const configContent = env.codexConfigExiste
          ? readFileSync(join(process.env.USERPROFILE || process.env.HOME || '', '.codex/config.toml'), 'utf8')
          : '';
        if (!configContent.includes('[mcp_servers.playwright]')) {
          acciones.push({
            paso: 'MANUAL',
            instruccion: 'Ejecutar: codex mcp add --name playwright --transport stdio "npx @playwright/mcp@0.0.76 --headless"',
          });
        } else {
          acciones.push({ paso: 'INFO', instruccion: 'playwright ya registrado en Codex config.toml' });
        }
      }
    }

    plan.servidores.push({ id: 'playwright', estado: env.npx ? 'pendiente_aprobacion' : 'bloqueado', perfiles: ['frontend-ui'], acciones });
  }

  // ── postgres-local-readonly ─────────────────────────────────────────────
  if (respuestas.usarPostgres === 's') {
    const acciones = [];
    let estado = 'configurado';

    if (!env.POSTGRES_MCP_URL) {
      estado = 'pendiente_autenticacion';
      acciones.push({
        paso: 'MANUAL',
        instruccion: [
          'Crear usuario de solo lectura en PostgreSQL:',
          '  psql -U postgres -c "CREATE USER edura_readonly WITH PASSWORD \'<clave>\';"',
          '  psql -U postgres -c "GRANT CONNECT ON DATABASE edura_dev TO edura_readonly;"',
          '  psql -U postgres -c "GRANT USAGE ON SCHEMA public TO edura_readonly;"',
          '  psql -U postgres -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO edura_readonly;"',
          'Luego configurar variable (PowerShell):',
          '  [System.Environment]::SetEnvironmentVariable("POSTGRES_MCP_URL","postgresql://edura_readonly:<clave>@localhost:5432/edura_dev","User")',
          'Reiniciar Claude Code y ejecutar: node scripts/ai/mcp-manager.mjs test postgres-local-readonly',
        ].join('\n        '),
      });
    } else {
      acciones.push({ paso: 'INFO', instruccion: 'POSTGRES_MCP_URL configurada. Ejecutar: node scripts/ai/mcp-manager.mjs test postgres-local-readonly' });
    }

    plan.servidores.push({ id: 'postgres-local-readonly', estado, perfiles: ['database-review'], acciones });
  }

  // ── github ──────────────────────────────────────────────────────────────
  if (respuestas.usarGithub === 's') {
    const acciones = [];
    let estado = 'instalado';

    if (!env.GITHUB_TOKEN) {
      estado = 'pendiente_autenticacion';
      acciones.push({
        paso: 'MANUAL',
        instruccion: [
          'Crear Personal Access Token fino en: https://github.com/settings/tokens/new',
          'Permisos mínimos: Contents (read), Pull Requests (r/w), Issues (r/w)',
          'Restricción: solo al repositorio EDURA',
          'Configurar variable (PowerShell):',
          '  [System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN","ghp_...","User")',
          'No pegar el token en este chat.',
        ].join('\n        '),
      });
    } else {
      acciones.push({ paso: 'INFO', instruccion: 'GITHUB_TOKEN configurado. Verificar con: codex mcp list' });
    }

    plan.servidores.push({ id: 'github-plugin-codex', estado, perfiles: ['pr-review'], acciones });
  }

  // ── notebooklm ──────────────────────────────────────────────────────────
  if (respuestas.usarNotebookLM === 's') {
    const acciones = [];
    let estado = 'propuesto';

    if (env.gcloud && env.GOOGLE_CLOUD_PROJECT) {
      estado = 'configurado';
      acciones.push({ paso: 'INFO', instruccion: 'gcloud detectado y GOOGLE_CLOUD_PROJECT configurado. Stub activo en tools/notebooklm-adapter/. Implementación real requiere licencia NotebookLM Enterprise.' });
    } else {
      if (!env.gcloud) {
        acciones.push({ paso: 'MANUAL', instruccion: 'Instalar Google Cloud CLI: https://cloud.google.com/sdk/docs/install' });
        acciones.push({ paso: 'MANUAL', instruccion: 'Autenticar: gcloud auth application-default login' });
      }
      if (!env.GOOGLE_CLOUD_PROJECT) {
        acciones.push({
          paso: 'MANUAL',
          instruccion: [
            'Configurar proyecto Google Cloud:',
            '  [System.Environment]::SetEnvironmentVariable("GOOGLE_CLOUD_PROJECT","<id-proyecto>","User")',
            'Requiere licencia NotebookLM Enterprise activa.',
          ].join('\n        '),
        });
      }
    }

    plan.servidores.push({ id: 'notebooklm', estado, perfiles: ['docs-research'], acciones });
  }

  // ── stitch ──────────────────────────────────────────────────────────────
  if (respuestas.usarStitch === 's') {
    const acciones = [];
    let estado = env.STITCH_API_KEY ? 'configurado' : 'pendiente_autenticacion';

    if (!env.STITCH_API_KEY) {
      acciones.push({
        paso: 'MANUAL',
        instruccion: [
          'Obtener API key en Stitch dashboard',
          'Configurar variable:',
          '  [System.Environment]::SetEnvironmentVariable("STITCH_API_KEY","<key>","User")',
        ].join('\n        '),
      });
    } else {
      acciones.push({ paso: 'INFO', instruccion: 'STITCH_API_KEY configurada. Listo para integrar cuando haya tarea de diseño.' });
    }

    plan.servidores.push({ id: 'stitch', estado, perfiles: ['frontend-ui'], acciones });
  }

  return plan;
}

// ── Formato de salida del plan ───────────────────────────────────────────────

function imprimirPlan(plan) {
  log();
  sep('═');
  log(' PLAN DE CONFIGURACIÓN MCP — EDURA');
  sep('═');
  log(`  Generado   : ${plan.generado}`);
  log(`  Detectadas : ${plan.plataformas_detectadas.join(', ') || 'ninguna'}`);
  log(`  Usará      : ${plan.plataformas_usara.join(', ')}`);
  log();

  plan.servidores.forEach(s => {
    sep('─', 50);
    log(` Servidor: ${s.id}`);
    log(` Estado  : ${s.estado}`);
    log(` Perfiles: ${s.perfiles.join(', ')}`);
    log(` Acciones:`);
    s.acciones.forEach((a, i) => {
      log(`   ${i + 1}. [${a.paso}]`);
      a.instruccion.split('\n').forEach(l => log(`        ${l}`));
    });
    log();
  });

  sep('═');
  log(' PRÓXIMOS PASOS GLOBALES');
  sep('─', 50);
  log('  1. Completar todos los pasos MANUAL marcados arriba');
  log('  2. Ejecutar: node scripts/ai/mcp-manager.mjs discover');
  log('     Para verificar variables de entorno configuradas');
  log('  3. Ejecutar: node scripts/ai/mcp-manager.mjs test edura-contexto');
  log('     Para confirmar el servidor local funciona correctamente');
  log('  4. Reiniciar Claude Code para cargar .mcp.json con MCPs actualizados');
  log('  5. Ver estado final: node scripts/ai/mcp-manager.mjs list');
  log();
  log('  Referencia de credenciales: config/agents/mcp.env.example');
  log('  Documentación: docs/ai/guias/credenciales-mcp.md');
  sep('═');
  log();
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log();
  log(' Setup asistido de MCP — EDURA');
  log(' Este asistente detecta tu entorno y genera un plan de configuración.');
  log(' No se solicitarán secretos ni credenciales en este proceso.');
  if (FLAG_NON_INTERACTIVE) log(' Modo no interactivo: usando respuestas por defecto (Claude Code solamente).');
  log();

  const env = detectarEntorno();

  log(' Entorno detectado:');
  log(`  Claude Code  : ${env.claude ? `✓ ${env.claude}` : '✗ no detectado'}`);
  log(`  Codex        : ${env.codex ? `✓ ${env.codex}` : '✗ no detectado'}`);
  log(`  Antigravity  : ${env.antigravity ? `✓ ${env.antigravity}` : '✗ no detectado'}`);
  log(`  Node.js      : ${env.node ? `✓ ${env.node}` : '✗ no detectado'}`);
  log(`  npx          : ${env.npx ? '✓' : '✗'}`);
  log(`  gcloud       : ${env.gcloud ? '✓' : '✗ no detectado'}`);
  log(`  Server MCP   : ${env.serverMjsExiste ? '✓ tools/mcp-edura-contexto/server.mjs' : '✗ no encontrado'}`);
  log(`  .mcp.json    : ${env.mcpJsonExiste ? '✓' : '✗ no encontrado'}`);
  log();

  // Preguntas mínimas
  const plataformasDisponibles = [];
  if (env.claude) plataformasDisponibles.push('claude-code');
  if (env.codex) plataformasDisponibles.push('codex');
  if (env.antigravity) plataformasDisponibles.push('antigravity');
  if (plataformasDisponibles.length === 0) plataformasDisponibles.push('claude-code');

  log(` Plataformas detectadas: ${plataformasDisponibles.join(', ')}`);

  const usarPlaywright = await preguntar('¿Usar Playwright para verificación visual de UI?', ['s', 'n'], 'n');
  const usarPostgres = await preguntar('¿Usar PostgreSQL MCP para revisar esquema local?', ['s', 'n'], 'n');
  const usarGithub = await preguntar('¿Usar GitHub plugin (solo perfil pr-review)?', ['s', 'n'], 'n');
  const usarNotebookLM = await preguntar('¿Usar NotebookLM para investigación documental?', ['s', 'n'], 'n');
  const usarStitch = await preguntar('¿Usar Stitch para prototipos de diseño?', ['s', 'n'], 'n');

  if (rl) rl.close();

  const respuestas = {
    plataformas: plataformasDisponibles,
    usarPlaywright,
    usarPostgres,
    usarGithub,
    usarNotebookLM,
    usarStitch,
  };

  const plan = generarPlan(env, respuestas);

  if (FLAG_JSON) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  imprimirPlan(plan);

  // Guardar plan como referencia
  const planPath = join(ROOT, 'config/agents/mcp.setup-plan.json');
  try {
    mkdirSync(join(ROOT, 'config/agents'), { recursive: true });
    writeFileSync(planPath, JSON.stringify(plan, null, 2));
    log(`  Plan guardado en: config/agents/mcp.setup-plan.json`);
    log();
  } catch { /* no crítico */ }
}

main().catch(e => {
  console.error('Error en setup:', e.message);
  process.exit(1);
});
